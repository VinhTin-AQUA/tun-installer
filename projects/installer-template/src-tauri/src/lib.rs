mod adapters;
mod bootstrapper;
mod commands;
mod events;
mod helpers;
mod services;
mod states;

use commands::*;
use domain::InstallerDocument;
use service::Compressor;
use std::sync::Arc;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;

use crate::{
    adapters::TauriProgressReporter,
    bootstrapper::{extract_data_inner, init_project_state},
    states::app_state::AppState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // extract

    // get config

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

            let start = std::time::Instant::now();
            println!("START");

            let reporter = TauriProgressReporter::new(app.handle().clone());
            let compressor = Arc::new(Compressor::new(reporter));
            let app_state = AppState { compressor };
            app.manage(app_state);

            let state = app.state::<AppState>();
            let installer_document = extract_data_inner(&state)?;

            app.manage(Mutex::new(InstallerDocument {
                properties: installer_document.properties.clone(),
                registry_keys: installer_document.registry_keys.clone(),
                window_infos: installer_document.window_infos.clone(),
                prerequisites: installer_document.prerequisites.clone(),
            }));

            let project_state = init_project_state(&state)?;
            app.manage(Mutex::new(project_state));

            let install_window_info = installer_document.window_infos.installer_window;

            // let webview_window =
            WebviewWindowBuilder::new(app.handle(), "main", WebviewUrl::App("/".into()))
                .title(install_window_info.title)
                .inner_size(
                    install_window_info.width,
                    install_window_info.height,
                )
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
            clean_uninstall_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
