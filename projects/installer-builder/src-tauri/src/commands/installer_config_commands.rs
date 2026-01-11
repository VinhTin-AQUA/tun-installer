use crate::{models::InstallerDocumentContent, services::save_installer_config};
use tauri::command;

#[command]
pub async fn save_installer_config_command(
    file_path: String,
    payload: InstallerDocumentContent,
) -> Result<Option<bool>, String> {
    let r = save_installer_config(file_path, payload)
        .await
        .map_err(|x| x.to_string())?;

    Ok(r)
}
