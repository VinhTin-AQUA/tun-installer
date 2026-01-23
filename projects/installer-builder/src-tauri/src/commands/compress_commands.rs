use tauri::command;

use crate::services::{compress_installer, extract_installer};

#[command]
pub fn compress_installer_command() -> Result<(), String> {
    _ = compress_installer();

    Ok(())
}

#[command]
pub fn extract_installer_command() -> Result<(), String> {
    _ = extract_installer();

    Ok(())
}
