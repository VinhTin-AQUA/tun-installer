mod adapters;
mod commands;
mod consts;
mod helpers;
mod models;
mod services;
mod states;
use std::sync::Arc;

use commands::*;
use tauri::Manager;

use crate::{
    adapters::TauriProgressReporter,
    services::Compressor,
    states::{AppState, ProjectState},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
            app.manage(std::sync::Mutex::new(ProjectState::default()));
            
            let reporter = TauriProgressReporter::new(app.handle().clone());
            let compressor = Arc::new(Compressor::new(reporter));
            let app_state = AppState { compressor };
            app.manage(Arc::new(app_state));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            write_data_to_exe_command,
            preview_installer_ui_command,
            save_installer_config_command,
            update_project_state_command,
            load_project_state_command,
            load_installer_document_config_command,
            load_html_first_time_install_pages_command,
            load_html_maintenance_pages_command,
            read_subfolders_command,
            read_files_in_folder_command,
            create_tuninstaller_project_command,
            open_tuninstaller_project_command,
            compress_installer_command,
            // extract_installer_command,
            cancel_compress_command,
            // cancel_extract_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
