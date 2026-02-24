use std::{path::PathBuf, sync::Arc};

use domain::RESOURCES_DIR;
use helpers::set_exe_icon;
use service::{CompressProgressReporter, Compressor};

use crate::{services::load_installer_document_config, states::ProjectState};

pub async fn compress_installer_core<R>(
    compressor: Arc<Compressor<R>>,
    exe_template: PathBuf,
    rcedit_path: PathBuf,
    project_state: tokio::sync::MutexGuard<'_, ProjectState>,
) -> Result<PathBuf, String>
where
    R: CompressProgressReporter + Send + Sync + 'static,
{
    let exe_template_name = exe_template
        .file_name()
        .ok_or("Exe file name not found")?
        .to_string_lossy()
        .to_string();

    let output_dir = PathBuf::from(project_state.project_dir.clone()).join("output");
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    let exe_path = output_dir.join(&exe_template_name);
    std::fs::copy(&exe_template, &exe_path).map_err(|e| e.to_string())?;

    // load config
    let config_file_path = PathBuf::from(project_state.config_dir.clone()).join("config.json");

    let installer_config =
        load_installer_document_config(config_file_path.to_string_lossy().to_string())
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Invalid installer config")?;

    // set icon
    let icon_path = PathBuf::from(project_state.project_dir.clone())
        .join(RESOURCES_DIR)
        .join(installer_config.properties.icon);

    if icon_path.exists() {
        set_exe_icon(&rcedit_path, &exe_path, &icon_path).map_err(|e| e.to_string())?;
    }

    // compress
    let exe_for_compress = exe_path.clone();
    let compressor_clone = compressor.clone();

    let paths: Vec<PathBuf> = vec![
        PathBuf::from(project_state.prerequisite_dir.clone()),
        PathBuf::from(project_state.resource_dir.clone()),
        PathBuf::from(project_state.page_dir.clone()),
        PathBuf::from(project_state.config_dir.clone()),
    ];

    tokio::task::spawn_blocking(move || {
        compressor_clone.compress_installer(paths, exe_for_compress)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    let new_name = format!("{}.exe", installer_config.properties.product_name);
    let new_path = output_dir.join(&new_name);

    std::fs::rename(&exe_path, &new_path).map_err(|e| e.to_string())?;

    Ok(new_path)
}
