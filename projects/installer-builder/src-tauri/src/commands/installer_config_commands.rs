use std::sync::Mutex;

use crate::{
    models::InstallerDocumentConfig,
    services::{load_installer_document_config, save_installer_config},
    states::WorkingConfigState,
};
use tauri::{command, State};

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
pub fn update_working_config_command(
    state: State<'_, Mutex<WorkingConfigState>>,
    data: WorkingConfigState,
) -> Result<Option<bool>, String> {
    let mut state = state.lock().unwrap();

    state.config_dir = data.config_dir;
    state.page_dir = data.page_dir;
    state.prerequisite_dir = data.prerequisite_dir;
    state.resource_dir = data.resource_dir;

    state.config_file = data.config_file;
    state.project_file = data.project_file;
    state.project_dir = data.project_dir;

    state.is_dirty = data.is_dirty;
    Ok(Some(true))
}

#[command]
pub fn load_working_config_command(
    state: State<'_, Mutex<WorkingConfigState>>,
) -> Result<Option<WorkingConfigState>, String> {
    let state: std::sync::MutexGuard<'_, WorkingConfigState> = state.lock().unwrap();
    Ok(Some(WorkingConfigState {
        config_dir: state.config_dir.clone(),
        page_dir: state.page_dir.clone(),
        prerequisite_dir: state.prerequisite_dir.clone(),
        resource_dir: state.resource_dir.clone(),

        config_file: state.config_file.clone(),
        project_file: state.project_file.clone(),
        project_dir: state.project_dir.clone(),
        
        is_dirty: state.is_dirty.clone(),
    }))
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
