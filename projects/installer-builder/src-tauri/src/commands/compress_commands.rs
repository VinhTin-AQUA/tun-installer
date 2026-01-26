use std::{path::PathBuf};

use crate::states::{AppState, ProjectState};
use tauri::{command, State};
use tokio::sync::Mutex;

#[command]
pub async fn compress_installer_command(
    app_state: State<'_, AppState>,
    project_state: State<'_, Mutex<ProjectState>>,
) -> Result<bool, String> {
    let compressor = app_state.compressor.clone();
    let mut paths: Vec<PathBuf> = Vec::new();
    let project_state = project_state.lock().await;
    
    paths.push(PathBuf::from(project_state.config_dir.clone()));
    paths.push(PathBuf::from(project_state.page_dir.clone()));
    paths.push(PathBuf::from(project_state.prerequisite_dir.clone()));
    paths.push(PathBuf::from(project_state.resource_dir.clone()));

    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from(project_state.project_dir.clone()).join("template.exe");

    tauri::async_runtime::spawn_blocking(move || compressor.compress_installer(paths, exe))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
}

#[command]
pub async fn extract_installer_command(
    app_state: State<'_, AppState>,
    folders: Vec<String>,
) -> Result<bool, String> {
    let compressor = app_state.compressor.clone();

    let output: String = String::from("output");

    tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(output, folders)
            .map_err(|e| e.to_string());
        r
    })
    .await
    .map_err(|e| e.to_string())?
}

#[command]
pub async fn cancel_compress_command(app_state: State<'_, AppState>) -> Result<(), String> {
    app_state.compressor.cancel().map_err(|e| e.to_string())
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
