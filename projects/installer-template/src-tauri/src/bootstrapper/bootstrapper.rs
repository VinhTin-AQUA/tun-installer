use domain::{InstallerDocument, CONFIG_DIR, HTML_PAGE_DIR, PREREQUISITE_DIR, RESOURCES_DIR};
use std::env;

use crate::states::{AppState, ProjectState};

pub fn extract_data_inner(app_state: &AppState) -> Result<InstallerDocument, String> {
    let compressor = app_state.compressor.clone();

    // let base_dir = PathBuf::from(
    //     "/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app",
    // );

    let exe_path_buf = std::env::current_exe().map_err(|e| e.to_string())?;
    let installer_document: InstallerDocument = compressor
        .read_data_from_installer(&exe_path_buf, CONFIG_DIR, "config.json", |data| {
            let s = String::from_utf8(data)?;
            Ok(serde_json::from_str(&s)?)
        })
        .map_err(|e| e.to_string())?;
    let temp_app_dir = env::temp_dir().join(installer_document.properties.product_name.clone());
    let folders = vec![CONFIG_DIR.to_string(), HTML_PAGE_DIR.to_string()];

    compressor
        .extract_installer(
            temp_app_dir.to_string_lossy().to_string(),
            folders,
            exe_path_buf,
        )
        .map_err(|e| e.to_string())?;

    // let config_path = temp_app_dir.join("configs").join("config.json");
    // let config_str = std::fs::read_to_string(config_path).map_err(|e| e.to_string())?;
    // let installer_document: InstallerDocument =
    //     serde_json::from_str(&config_str).map_err(|e| e.to_string())?;

    Ok(installer_document)
}

pub fn init_project_state(app_state: &AppState) -> Result<ProjectState, String> {
    // let base_dir = env::current_exe()
    //     .expect("Không lấy được đường dẫn exe")
    //     .parent()
    //     .expect("Không lấy được thư mục chứa exe")
    //     .to_path_buf()
    //     .join(EXTRACT_DIR);

    // let base_dir: PathBuf =
    //     PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app")
    //         .join(EXTRACT_DIR);

    let compressor = app_state.compressor.clone();
    let exe_path_buf = std::env::current_exe().map_err(|e| e.to_string())?;

    let installer_document: InstallerDocument = compressor
        .read_data_from_installer(&exe_path_buf, CONFIG_DIR, "config.json", |data| {
            let s = String::from_utf8(data)?;
            Ok(serde_json::from_str(&s)?)
        })
        .map_err(|e| e.to_string())?;
    let temp_app_dir = env::temp_dir().join(installer_document.properties.product_name.clone());

    let r = ProjectState {
        project_dir: temp_app_dir.to_string_lossy().to_string(),
        config_dir: temp_app_dir.join(CONFIG_DIR).to_string_lossy().to_string(),
        config_file: temp_app_dir
            .join(CONFIG_DIR)
            .join("config.json")
            .to_string_lossy()
            .to_string(),
        is_dirty: false,
        page_dir: temp_app_dir
            .join(HTML_PAGE_DIR)
            .to_string_lossy()
            .to_string(),
        prerequisite_dir: temp_app_dir
            .join(PREREQUISITE_DIR)
            .to_string_lossy()
            .to_string(),
        project_file: "".to_string(),
        project_name: "".to_string(),
        resource_dir: temp_app_dir
            .join(RESOURCES_DIR)
            .to_string_lossy()
            .to_string(),
    };

    Ok(r)
}
