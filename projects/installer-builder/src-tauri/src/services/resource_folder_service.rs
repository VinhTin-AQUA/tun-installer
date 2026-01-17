use crate::models::{FileItem, FolderNode};
use anyhow::bail;
use std::path::Path;
use tokio::fs;

pub async fn read_subfolders(path: String) -> anyhow::Result<Vec<FolderNode>> {
    let root_path = Path::new(&path);
    if !root_path.exists() {
        bail!("Thư mục {} không tồn tại", path)
    }
    if !root_path.is_dir() {
        bail!("Path is not a directory: {}", path)
    }

    let mut nodes = Vec::new();
    let mut entries = fs::read_dir(root_path).await?;

    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();
        if path.is_dir() {
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let id = path.to_string_lossy().to_string();

            nodes.push(FolderNode {
                id,
                name,
                children: None,
                expanded: false,
            });
        }
    }
    Ok(nodes)
}

pub async fn read_files_in_folder(path: String) -> anyhow::Result<Vec<FileItem>> {
    let dir_path = Path::new(&path);
    if !dir_path.exists() || !dir_path.is_dir() {
        bail!("Invalid directory: {}", path)
    }

    let mut files = Vec::new();
    let mut entries = fs::read_dir(dir_path).await?;

    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();
        if path.is_file() {
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let physical_path = path.to_string_lossy().to_string();
            // Use path as ID for now
            let id = physical_path.clone();
            let folder_id = path
                .parent()
                .unwrap_or(Path::new(""))
                .to_string_lossy()
                .to_string();

            let metadata = fs::metadata(&path).await?;
            let size = metadata.len();
            let file_type = path
                .extension()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();

            files.push(FileItem {
                id,
                folder_id,
                name,
                size,
                file_type,
                physical_path,
            });
        }
    }
    Ok(files)
}
