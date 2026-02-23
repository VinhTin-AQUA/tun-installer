use anyhow::{bail, Result};
use domain::InstallerDocument;
use std::path::Path;
use tokio::fs;

use crate::helpers::{format_bytes, get_dir_size, get_free_space_bytes};

pub async fn save_installer_config(
    file_path: String,
    project_dir: String,
    payload: InstallerDocument,
) -> Result<Option<bool>> {
    let path = Path::new(&file_path);

    let parent_dir = path
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Đường dẫn file không hợp lệ"))?;

    if !parent_dir.exists() {
        bail!("Thư mục chưa tồn tại: {}", parent_dir.display());
    }

    println!("parent_dir = {:?}", parent_dir);

    let mut payload = payload;
    let available = get_free_space_bytes(Path::new("C:\\")).unwrap_or(0);
    let required = get_dir_size(Path::new(project_dir.as_str())).unwrap_or(0);
    let remaining = available.saturating_sub(required);

    payload.memory_space.volume_space_available = format_bytes(available);
    payload.memory_space.volume_space_required = format_bytes(required);
    payload.memory_space.volume_space_remaining = format_bytes(remaining);

    let json = serde_json::to_string_pretty(&payload)?;
    fs::write(file_path.as_str(), json).await?;

    Ok(Some(true))
}

pub async fn load_installer_document_config(
    file_path: String,
) -> Result<Option<InstallerDocument>> {
    let path = Path::new(&file_path);

    if !path.exists() {
        bail!("File cấu hình không tồn tại")
    }

    let content = fs::read_to_string(path)
        .await
        .map_err(|e| anyhow::anyhow!("Không thể đọc file: {}", e))?;

    let data: InstallerDocument = serde_json::from_str(&content)?;

    Ok(Some(data))
}
