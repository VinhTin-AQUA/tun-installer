use crate::states::{app_state::AppState, ProjectState};
use std::path::PathBuf;
use tauri::{command, State};
use tokio::sync::Mutex;

const EXTRACT_DIR: &str = "output";

#[command]
pub async fn extract_installer_command(
    app_state: State<'_, AppState>,
    project_state: State<'_, Mutex<ProjectState>>,
    folders: Vec<String>,
) -> Result<bool, String> {
    let project_state = project_state.lock().await;
    let compressor = app_state.compressor.clone();

       let base_dir: PathBuf =
        PathBuf::from("C:/Users/tinhv/Desktop/f/tun-installer/examples/first-app");
    // let exe_path_buf = std::env::current_exe()?;
    let exe_path_buf = base_dir.join("template.exe");
    let output_path_buf = base_dir.join(EXTRACT_DIR);

    println!("exe_path_buf = {:?}", exe_path_buf.to_string_lossy().to_string());

    tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(output_path_buf.to_string_lossy().to_string(), folders, exe_path_buf)
            .map_err(|e| e.to_string());
        r
    })
    .await
    .map_err(|e| e.to_string())?
}

#[command]
pub fn cancel_extract_command(app_state: State<'_, AppState>) -> Result<(), String> {
    let compressor = app_state.compressor.clone();
    compressor.cancel().map_err(|e| e.to_string())
}

#[command]
pub fn is_cancelled_command(app_state: State<'_, AppState>) -> Result<bool, String> {
    let compressor = app_state.compressor.clone();
    let r = compressor.is_cancelled();
    Ok(r)
}
