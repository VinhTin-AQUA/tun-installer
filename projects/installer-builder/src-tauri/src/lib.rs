mod commands;
mod consts;
mod models;
mod services;
mod states;
mod helpers;
use std::sync::Mutex;

use commands::*;
use tauri::Manager;

use crate::states::WorkingConfigState;

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
            app.manage(Mutex::new(WorkingConfigState::default()));
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
            create_tuninstaller_project_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
