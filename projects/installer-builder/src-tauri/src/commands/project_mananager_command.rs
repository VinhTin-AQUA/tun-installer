use anyhow::Result;
use domain::InstallerDocumentConfig;
use tauri::{State, command};
use tokio::sync::Mutex;

use crate::{
    models::TunInstallerProject,
    services::{
        create_tuninstaller_project, load_installer_document_config, open_tuninstaller_project,
        save_installer_document_config,
    }, states::ProjectState,
};

// create .tunins
#[command]
pub async fn create_installer_project_command(
    base_dir: String,
    project_name: String,
) -> Result<bool, String> {
    let r = create_tuninstaller_project(base_dir, project_name)
        .await
        .map_err(|e| e.to_string());

    r
}

// open .tunins
#[command]
pub async fn open_installer_project_command(
    project_path: String,
) -> Result<TunInstallerProject, String> {
    let r: Result<TunInstallerProject, String> = open_tuninstaller_project(project_path)
        .await
        .map_err(|e| e.to_string());

    r
}

// save config.json
#[command]
pub async fn save_installer_document_config_command(
    file_path: String,
    payload: InstallerDocumentConfig,
    state: State<'_, Mutex<ProjectState>>,
) -> Result<Option<bool>, String> {
     let state = state.lock().await;

    let r = save_installer_document_config(file_path, state.project_dir.clone(), payload)
        .await
        .map_err(|x| x.to_string())?;

    Ok(r)
}

// load config.json
#[command]
pub async fn load_installer_document_config_command(
    file_path: String,
) -> Result<Option<InstallerDocumentConfig>, String> {
    let r = load_installer_document_config(file_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(r)
}
