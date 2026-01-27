mod adapters;
mod bootstrapper;
mod commands;
mod states;

use shared_lib::Compressor;
use std::sync::Arc;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;

use crate::{
    adapters::TauriProgressReporter,
    states::{app_state::AppState, ProjectState},
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

            app.manage(Mutex::new(ProjectState::default()));

            let reporter = TauriProgressReporter::new(app.handle().clone());
            let compressor = Arc::new(Compressor::new(reporter));
            let app_state = AppState { compressor };
            app.manage(app_state);
            

            // let webview_window =
            WebviewWindowBuilder::new(app.handle(), "label", WebviewUrl::App("/".into()))
                .title("Installer")
                .inner_size(400.0, 400.0)
                .resizable(false)
                .fullscreen(false)
                .decorations(true)
                .transparent(false)
                .always_on_top(false)
                .center()
                .visible(true)
                .closable(true)
                .minimizable(true)
                .build()
                .unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
