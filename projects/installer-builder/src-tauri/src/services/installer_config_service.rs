use crate::models::InstallerDocumentContent;
use tokio::fs;

pub async fn save_installer_config(file_path: String, payload: InstallerDocumentContent) -> anyhow::Result<Option<bool>> {
    // Serialize sang JSON
    let json = serde_json::to_string_pretty(&payload)?;

    // Ghi file async
    fs::write(file_path.as_str(), json).await?;

     Ok(Some(true))
}
