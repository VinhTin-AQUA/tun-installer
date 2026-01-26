use std::sync::Arc;

use tauri::{command, AppHandle, State};

use crate::{adapters::TauriProgressReporter, services::Compressor, states::AppState};

#[command]
pub async fn compress_installer_command(
    app_state: State<'_, Arc<AppState>>,
) -> Result<bool, String> {
    let compressor = app_state.compressor.clone();

    let folders = vec![
        "C:/Users/tinhv/Desktop/f/tun-installer/examples/app/configs".to_string(),
        "C:/Users/tinhv/Desktop/f/tun-installer/examples/app/pages".to_string(),
        "C:/Users/tinhv/Desktop/f/tun-installer/examples/app/prerequisites".to_string(),
        "C:/Users/tinhv/Desktop/f/tun-installer/examples/app/resources".to_string(),
    ];

    tauri::async_runtime::spawn_blocking(move || compressor.compress_installer(folders))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
}

// #[command]
// pub async fn extract_installer_command(
//     app: AppHandle,
//     folders: Vec<String>,
// ) -> Result<bool, String> {
//     let reporter = TauriProgressReporter::new(app);
//     let compressor = Compressor::new(reporter);

//     let output: String = String::from("output");

//     tauri::async_runtime::spawn_blocking(move || {
//         let r = compressor
//             .extract_installer(output, folders)
//             .map_err(|e| e.to_string());
//         r
//     })
//     .await
//     .map_err(|e| e.to_string())?
// }

#[command]
pub async fn cancel_compress_command(app_state: State<'_, Arc<AppState>>) -> Result<(), String> {
    app_state.compressor.cancel().map_err(|e| e.to_string())
}

// #[command]
// pub fn cancel_extract_command(app: AppHandle) {
//     let reporter = TauriProgressReporter::new(app);
//     let compressor = Compressor::new(reporter);

//     compressor.cancel();
// }
