use crate::{
    models::{FileItem, FolderNode},
    services::{read_files_in_folder, read_subfolders},
};
use tauri::command;

#[command]
pub async fn read_subfolders_command(path: String) -> Result<Vec<FolderNode>, String> {
    let r = read_subfolders(path).await.map_err(|e| e.to_string());
    return r;
}

#[tauri::command]
pub async fn read_files_in_folder_command(path: String) -> Result<Vec<FileItem>, String> {
    let r = read_files_in_folder(path).await.map_err(|e| e.to_string());
    return r;
}
