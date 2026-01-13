use crate::models::InstallerDocumentConfig;
use anyhow::{bail, Result};
use std::path::Path;
use tokio::fs;

pub async fn save_installer_config(
    file_path: String,
    payload: InstallerDocumentConfig,
) -> Result<Option<bool>> {
    let path = Path::new(&file_path);

    let parent_dir = path
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Đường dẫn file không hợp lệ"))?;

    if !parent_dir.exists() {
        bail!("Thư mục chưa tồn tại: {}", parent_dir.display());
    }

    let json = serde_json::to_string_pretty(&payload)?;
    fs::write(file_path.as_str(), json).await?;

    Ok(Some(true))
}

pub async fn load_installer_document_config(
    file_path: String,
) -> Result<Option<InstallerDocumentConfig>> {
    let path = Path::new(&file_path);

    if !path.exists() {
        bail!("File cấu hình không tồn tại")
    }

    let content = fs::read_to_string(path).
            await
            .map_err(|e| anyhow::anyhow!("Không thể đọc file: {}", e))?;

    let data:InstallerDocumentConfig = serde_json::from_str(&content)?;

    Ok(Some(data))
}
