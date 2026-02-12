use crate::{
    helpers::{get_exe_template_res, get_rcedit_res},
    services::load_installer_document_config,
    states::{app_state::AppState, ProjectState},
};
use domain::RESOURCES_DIR;
use helpers::{copy_file_to_dir, set_exe_icon};
use std::path::PathBuf;
use tauri::{command, AppHandle, State};
use tokio::sync::Mutex;

#[command]
pub async fn compress_installer_command(
    app: AppHandle,
    app_state: State<'_, AppState>,
    project_state: State<'_, Mutex<ProjectState>>,
) -> Result<bool, String> {
    let compressor = app_state.compressor.clone();

    // ---- Lock project_state trong scope nhỏ ----
    let project_state = project_state.lock().await;

    let config_dir = project_state.config_dir.clone();
    let page_dir = project_state.page_dir.clone();
    let prerequisite_dir = project_state.prerequisite_dir.clone();
    let resource_dir = project_state.resource_dir.clone();
    let project_dir = project_state.project_dir.clone();

    drop(project_state); // 🔥 tránh giữ lock quá lâu

    // ---- Prepare paths ----
    let paths: Vec<PathBuf> = vec![
        PathBuf::from(config_dir.clone()),
        PathBuf::from(page_dir),
        PathBuf::from(prerequisite_dir),
        PathBuf::from(resource_dir),
    ];

    // ---- Copy template exe ----
    let exe_template = get_exe_template_res(&app).expect("Exe template not found");

    let exe_template_name = exe_template
        .file_name()
        .ok_or("Exe file name not found")?
        .to_string_lossy()
        .to_string();

    let output_dir = PathBuf::from(project_dir.clone()).join("output");

    copy_file_to_dir(exe_template, output_dir.clone(), exe_template_name.clone())
        .await
        .map_err(|e| e.to_string())?;

    let exe_path = output_dir.join(&exe_template_name);

    println!("Exe path: {:?}", exe_path);

    // ---- Load config ----
    let config_file_path = PathBuf::from(config_dir).join("config.json");

    let installer_config =
        load_installer_document_config(config_file_path.to_string_lossy().to_string())
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Invalid installer config")?;

    // ---- Set icon BEFORE compress ----
    let rcedit_path = get_rcedit_res(&app).expect("Could not get rcedit resource");

    let icon_path = PathBuf::from(project_dir.clone())
        .join(RESOURCES_DIR)
        .join(installer_config.properties.icon);

    set_exe_icon(&rcedit_path, &exe_path, &icon_path).map_err(|e| e.to_string())?;

    println!(
        "Size after set icon: {:?}",
        std::fs::metadata(&exe_path).map(|m| m.len()).unwrap_or(0)
    );

    // ---- Compress (blocking thread) ----
    let exe_for_compress = exe_path.clone();

    tauri::async_runtime::spawn_blocking(move || {
        compressor.compress_installer(paths, exe_for_compress)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    // 🔥 Windows có thể giữ handle một chút
    tokio::time::sleep(std::time::Duration::from_millis(200)).await;

    println!(
        "Size after compress: {:?}",
        std::fs::metadata(&exe_path).map(|m| m.len()).unwrap_or(0)
    );

    // ---- Rename LAST ----
    let new_name = format!("{}.exe", installer_config.properties.product_name);
    let new_path = output_dir.join(&new_name);

    tokio::fs::rename(&exe_path, &new_path)
        .await
        .map_err(|e| e.to_string())?;

    println!("Final exe: {:?}", new_path);

    Ok(true)
}

#[command]
pub async fn extract_installer_command(
    app_state: State<'_, AppState>,
    project_state: State<'_, Mutex<ProjectState>>,
    folders: Vec<String>,
) -> Result<bool, String> {
    let project_state = project_state.lock().await;

    let compressor = app_state.compressor.clone();
    let output: String = String::from("output");
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from(project_state.project_dir.clone()).join("exe_template_v1.0.0.exe");

    tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(output, folders, exe)
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
