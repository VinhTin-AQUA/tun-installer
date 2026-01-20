use crate::services::create_tuninstaller_project;
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
