mod adapters;
mod bootstrapper;
mod commands;
mod enums;
mod events;
mod helpers;
mod services;
mod states;

use ::helpers::get_current_exe;
use clap::Parser;
use commands::*;
use domain::InstallerDocument;
use service::Compressor;
use std::{fs::OpenOptions, io::Write, panic, path::PathBuf, process::Command, sync::Arc};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;

use crate::{
    adapters::TauriProgressReporter,
    bootstrapper::{extract_data_inner, init_project_state},
    enums::InstallerStatus,
    states::{app_state::AppState, InstallerArgs},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Catch panic toàn cục
    panic::set_hook(Box::new(|panic_info| {
        let msg = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic".to_string()
        };

        let location = panic_info
            .location()
            .map(|l| format!("{}:{}", l.file(), l.line()))
            .unwrap_or_else(|| "unknown location".into());

        log_to_file(&format!(
            "[PANIC]\nMessage: {}\nLocation: {}\n",
            msg, location
        ));
    }));

    // Bọc toàn bộ app bằng catch_unwind
    let result = panic::catch_unwind(|| {
        run_inner();
    });

    if let Err(err) = result {
        log_to_file(&format!("[FATAL] Application crashed: {:?}\n", err));
    }
}

fn run_inner() {
    let installer_args = InstallerArgs::parse();
    println!("{:?}", installer_args);

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            if !is_admin() {
                elevate();
            }

            let start = std::time::Instant::now();
            println!("START");

            app.manage(Mutex::new(installer_args));
            let installer_args = app.state::<tokio::sync::Mutex<InstallerArgs>>();
            let installer_args = installer_args.blocking_lock();

            let reporter = TauriProgressReporter::new(app.handle().clone());
            let compressor = Arc::new(Compressor::new(reporter));
            let app_state = AppState { compressor };
            app.manage(app_state);

            //
            let app_state = app.state::<AppState>();
            let installer_document = extract_data_inner(&app_state, &installer_args)?;

            //
            app.manage(Mutex::new(InstallerDocument {
                properties: installer_document.properties.clone(),
                registry_keys: installer_document.registry_keys.clone(),
                window_infos: installer_document.window_infos.clone(),
                prerequisites: installer_document.prerequisites.clone(),
            }));

            let project_state = init_project_state(&app_state)?;
            app.manage(Mutex::new(project_state));

            let install_window_info = if installer_args.status == InstallerStatus::Install {
                installer_document.window_infos.installer_window
            } else {
                installer_document.window_infos.uninstaller_window
            };

            // let webview_window =
            WebviewWindowBuilder::new(app.handle(), "main", WebviewUrl::App("/".into()))
                .title(install_window_info.title)
                .inner_size(install_window_info.width, install_window_info.height)
                .resizable(false)
                .fullscreen(false)
                .decorations(true)
                .transparent(false)
                .always_on_top(install_window_info.always_on_top)
                .center()
                .visible(true)
                .closable(true)
                .minimizable(true)
                .build()
                .unwrap();

            let duration = start.elapsed();
            println!("END: {:?}", duration);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_project_state_command,
            get_installer_document_command,
            load_html_first_time_install_pages_command,
            load_html_maintenance_pages_command,
            preview_installer_ui_command,
            extract_installer_command,
            cancel_extract_command,
            is_cancelled_command,
            install,
            uninstall_command,
            clean_uninstall_command,
            get_installer_args_command,
            close_current_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn log_to_file(message: &str) {
    let exe_dir: PathBuf = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));

    let log_path = exe_dir.join("error.log");

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(log_path) {
        let _ = writeln!(file, "{}", message);
    }
}

fn is_admin() -> bool {
    Command::new("net")
        .arg("session")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn elevate() {
    let exe_path = get_current_exe();

    Command::new("powershell")
        .args([
            "Start-Process",
            exe_path.to_str().unwrap(),
            "-Verb",
            "runAs",
        ])
        .spawn()
        .unwrap();

    std::process::exit(0);
}
