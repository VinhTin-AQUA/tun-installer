use crate::{models::InstallerDocumentConfig, services::{create_tuninstaller_project, load_installer_document_config, save_installer_config}};
use anyhow::Result;
use tauri::command;

#[command]
pub fn create_tuninstaller_project_command(
    base_dir: String,
    project_name: String,
) -> Result<bool, String> {
    let r: Result<bool, String> =
        create_tuninstaller_project(base_dir, project_name).map_err(|e| e.to_string());

    r
}

#[command]
pub async fn save_installer_config_command(
    file_path: String,
    payload: InstallerDocumentConfig,
) -> Result<Option<bool>, String> {
    let r = save_installer_config(file_path, payload)
        .await
        .map_err(|x| x.to_string())?;

    Ok(r)
}

#[command]
pub async fn load_installer_document_config_command(
    file_path: String,
) -> Result<Option<InstallerDocumentConfig>, String> {
    let r = load_installer_document_config(file_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(r)
}
