mod commands;
mod models;
mod services;
mod states;
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
            load_html_pages_command,
            preview_installer_ui_command,
            save_installer_config_command,
            update_working_config_command,
            load_working_config_command,
            load_installer_document_config_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
