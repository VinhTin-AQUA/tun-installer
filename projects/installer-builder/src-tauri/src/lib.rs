mod adapters;
mod cli;
mod commands;
mod helpers;
mod models;
mod services;
mod states;
use std::{env, io, path::PathBuf, sync::Arc};

use clap::Parser;
use commands::*;
use domain::{CONFIG_DIR, HTML_PAGE_DIR, PREREQUISITE_DIR, RESOURCES_DIR};
use service::Compressor;
use tauri::Manager;
use tokio::sync::Mutex;

use crate::{
    adapters::{CLIProgressReporter, TauriProgressReporter},
    cli::AppArgs,
    services::compress_installer_core,
    states::{app_state::AppState, ProjectState},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_args = AppArgs::parse();
    println!("{:?}", app_args);

    if app_args.cli {
        let runtime = tokio::runtime::Runtime::new().unwrap();
        runtime.block_on(async {
            match run_cli(app_args.project).await {
                Ok(_) => println!("Done!!"),
                Err(e) => eprintln!("{}", e),
            }
        });
    } else {
        run_gui();
    }
}

pub fn run_gui() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            app.manage(Mutex::new(ProjectState::default()));

            let reporter = TauriProgressReporter::new(app.handle().clone());
            let compressor = Arc::new(Compressor::new(reporter));
            let app_state = AppState { compressor };
            app.manage(app_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            preview_installer_ui_command,
            save_installer_document_config_command,
            update_project_state_command,
            load_project_state_command,
            load_installer_document_config_command,
            load_html_first_time_install_pages_command,
            load_html_maintenance_pages_command,
            read_subfolders_command,
            read_files_in_folder_command,
            create_installer_project_command,
            open_installer_project_command,
            compress_installer_command,
            extract_installer_command,
            cancel_compress_command,
            cancel_extract_command,
            is_cancelled_command,
            get_prerequisites_command,
            close_current_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub async fn run_cli(project_file: String) -> Result<(), String> {
    let project_file_path_buf = PathBuf::from(project_file.clone());
    if !project_file_path_buf.exists() {
        return Err(format!("Project file '{}' not found", project_file.clone()));
    }

    let project_dir = project_file_path_buf
        .parent()
        .expect("Project dir not found");
    let project_name = project_file_path_buf
        .file_name()
        .expect("Project dir not found");

    let project_state: ProjectState = ProjectState {
        config_dir: project_dir.join(CONFIG_DIR).to_string_lossy().to_string(),
        page_dir: project_dir
            .join(HTML_PAGE_DIR)
            .to_string_lossy()
            .to_string(),
        prerequisite_dir: project_dir
            .join(PREREQUISITE_DIR)
            .to_string_lossy()
            .to_string(),
        resource_dir: project_dir
            .join(RESOURCES_DIR)
            .to_string_lossy()
            .to_string(),

        config_file: project_dir
            .join(CONFIG_DIR)
            .join("config.json")
            .to_string_lossy()
            .to_string(),
        project_file: project_file_path_buf.to_string_lossy().to_string(),
        project_dir: project_dir.to_string_lossy().to_string(),
        project_name: project_name.to_string_lossy().to_string(),

        is_dirty: false,
    };

    let project_state_mutex = Mutex::new(project_state.clone());
    let project_state_guard = project_state_mutex.lock().await;
    let exe_template = resolve_resource("exe_template_v1.0.0.exe")?;
    let rcedit = resolve_resource("rcedit.exe")?;

    let reporter = CLIProgressReporter::new();
    let compressor = Arc::new(Compressor::new(reporter));

    // compress_installer_core(compressor, exe_template, rcedit, project_state_guard).await?;
    println!("hello world");

    println!("project_state = {:?}", project_state);

    Ok(())
}

fn resolve_resource(filename: &str) -> Result<PathBuf, String> {
    let mut exe_path =
        std::env::current_exe().map_err(|e| format!("Cannot get current exe path: {}", e))?;

    exe_path.pop(); // bỏ tên exe

    #[cfg(target_os = "macos")]
    {
        // Nếu build dạng .app:
        // MyApp.app/Contents/MacOS/
        // resource ở: MyApp.app/Contents/Resources/
        exe_path.pop(); // MacOS
        exe_path.pop(); // Contents
        exe_path.push("Resources");
    }

    #[cfg(not(target_os = "macos"))]
    {
        exe_path.push("resources");
    }

    exe_path.push(filename);

    if !exe_path.exists() {
        return Err(format!("Resource not found: {}", exe_path.display()));
    }

    Ok(exe_path)
}
