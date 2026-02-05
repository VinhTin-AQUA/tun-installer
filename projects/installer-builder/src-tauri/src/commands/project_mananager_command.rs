use crate::{
    models::{InstallerDocument, TunInstallerProject},
    services::{
        create_tuninstaller_project, load_installer_document_config, open_tuninstaller_project,
        save_installer_config,
    },
};
use anyhow::Result;
use tauri::command;

#[command]
pub async fn create_tuninstaller_project_command(
    base_dir: String,
    project_name: String,
) -> Result<bool, String> {
    let r = create_tuninstaller_project(base_dir, project_name)
        .await
        .map_err(|e| e.to_string());

    r
}

#[command]
pub async fn save_installer_config_command(
    file_path: String,
    payload: InstallerDocument,
) -> Result<Option<bool>, String> {
    let r = save_installer_config(file_path, payload)
        .await
        .map_err(|x| x.to_string())?;

    Ok(r)
}

#[command]
pub async fn load_installer_document_config_command(
    file_path: String,
) -> Result<Option<InstallerDocument>, String> {
    let r = load_installer_document_config(file_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(r)
}

#[command]
pub async fn open_tuninstaller_project_command(
    project_path: String,
) -> Result<TunInstallerProject, String> {
    let r: Result<TunInstallerProject, String> = open_tuninstaller_project(project_path)
        .await
        .map_err(|e| e.to_string());

    r
}
