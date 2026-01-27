use crate::states::app_state::AppState;
use std::path::PathBuf;

pub async fn extract_data_inner(app_state: &AppState) -> Result<bool, String> {
    let compressor = app_state.compressor.clone(); // ✅ Arc clone

    // let exe = std::env::current_exe()?;

    let exe = PathBuf::from(
        "/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app/template.exe",
    );
    let output: String = String::from(
        "/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app/output",
    );
    let folders = vec!["configs".to_string(), "pages".to_string()];

    tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(output, folders, exe)
            .map_err(|e| e.to_string());
        r
    })
    .await
    .map_err(|e| e.to_string())?
}
