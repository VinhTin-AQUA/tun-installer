use anyhow::{bail, Result};
use domain::InstallerDocumentConfig;
use helpers::{get_dir_size, get_free_space_bytes};
use std::path::Path;
use tokio::fs;

pub async fn save_installer_document_config(
    file_path: String,
    project_dir: String,
    payload: InstallerDocumentConfig,
) -> Result<Option<bool>> {
    let path = Path::new(&file_path);

    let parent_dir = path
        .parent()
        .ok_or_else(|| anyhow::anyhow!("Prject directory does not exists"))?;

    if !parent_dir.exists() {
        bail!("Prject directory does not exists: {}", parent_dir.display());
    }

    let mut payload = payload;
    payload.memory_space.volume_space_available = 0;
    payload.memory_space.volume_space_required =
        get_dir_size(Path::new(project_dir.as_str())).unwrap_or(0);
    payload.memory_space.volume_space_remaining = 0;

    let json = serde_json::to_string_pretty(&payload)?;
    fs::write(file_path.as_str(), json).await?;

    Ok(Some(true))
}

pub async fn load_installer_document_config(
    file_path: String,
) -> Result<Option<InstallerDocumentConfig>> {
    let path = Path::new(&file_path);

    if !path.exists() {
        bail!("config.json does not exists")
    }

    let content = fs::read_to_string(path)
        .await
        .map_err(|e| anyhow::anyhow!("Can not read config.json: {}", e))?;

    let mut data: InstallerDocumentConfig = serde_json::from_str(&content)?;

    let available = get_free_space_bytes(Path::new("C:\\")).unwrap_or(0);
    let remaining = available.saturating_sub(data.memory_space.volume_space_required);
    data.memory_space.volume_space_available = available;
    data.memory_space.volume_space_remaining = remaining;

    Ok(Some(data))
}
