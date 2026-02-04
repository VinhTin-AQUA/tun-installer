use crate::models::{prerequisite, Prerequisite};
use anyhow::bail;
use shared_lib::PREREQUISITE_DIR;
use std::path::PathBuf;
use tokio::fs;

pub async fn get_prerequisites(project_dir: String) -> anyhow::Result<Vec<Prerequisite>> {
    let prerequisite_dir = PathBuf::from(project_dir).join(PREREQUISITE_DIR);

    if !prerequisite_dir.exists() || !prerequisite_dir.is_dir() {
        bail!("Invalid directory: {}", prerequisite_dir.to_string_lossy());
    }

    let mut prerequisites = Vec::new();
    let mut entries = fs::read_dir(&prerequisite_dir).await?;

    while let Some(entry) = entries.next_entry().await? {
        let metadata = entry.metadata().await?;

        // chỉ lấy file
        if metadata.is_file() {
            let file_name = entry.file_name();
            let size_bytes = metadata.len();
            let size_mb = size_bytes as f64 / 1024.0 / 1024.0;
            let size_mb_rounded = (size_mb * 100.0).round() / 100.0;
            // println!(
            //     "{} - {:.2} MB",
            //     file_name.to_string_lossy(),
            //     size_mb
            // );

            prerequisites.push(Prerequisite {
                name: file_name.to_string_lossy().to_string(),
                install_phase: prerequisite::InstallPhase::After,
                run_as_admin: false,
                size: size_mb_rounded,
            });
        }
    }

    Ok(prerequisites)
}
