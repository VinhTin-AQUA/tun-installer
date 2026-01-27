mod commands;
use commands::*;
use tauri::{WebviewUrl, WebviewWindowBuilder};

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

            // let webview_window =
            WebviewWindowBuilder::new(
                app.handle(),
                "label",
                WebviewUrl::App("/".into()),
            )
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
        .invoke_handler(tauri::generate_handler![read_data_from_exe_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
