use shared_lib::{CONFIG_DIR, HTML_PAGE_DIR, PREREQUISITE_DIR, RESOURCES_DIR};

use crate::{
    models::InstallerDocument,
    states::{app_state::AppState, ProjectState},
};
use std::{env, path::PathBuf};

const EXTRACT_DIR: &str = "output";

pub fn extract_data_inner(app_state: &AppState) -> InstallerDocument {
    let compressor = app_state.compressor.clone();

    let base_dir: PathBuf =
        PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app");
    // let exe_path_buf = std::env::current_exe()?;
    let exe_path_buf = base_dir.join("template.exe");
    let output_path_buf = base_dir.join(EXTRACT_DIR);
    let folders = vec!["configs".to_string(), "pages".to_string()];

    // extract
    _ = compressor
        .extract_installer(
            output_path_buf.to_string_lossy().to_string(),
            folders,
            exe_path_buf,
        )
        .map_err(|e| e.to_string());

    let config_path = output_path_buf.join("configs").join("config.json");
    let config_str = std::fs::read_to_string(config_path).unwrap();
    let installer_document: InstallerDocument = serde_json::from_str(&config_str).unwrap();

    installer_document
}

pub fn init_project_state() -> ProjectState {
    // let base_dir = env::current_exe()
    //     .expect("Không lấy được đường dẫn exe")
    //     .parent()
    //     .expect("Không lấy được thư mục chứa exe")
    //     .to_path_buf()
    //     .join(EXTRACT_DIR);

     let base_dir: PathBuf =
        PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app").join(EXTRACT_DIR);

    ProjectState {
        project_dir: base_dir.to_string_lossy().to_string(),
        config_dir: base_dir.join(CONFIG_DIR).to_string_lossy().to_string(),
        config_file: base_dir
            .join(CONFIG_DIR)
            .join("config.json")
            .to_string_lossy()
            .to_string(),
        is_dirty: false,
        page_dir: base_dir.join(HTML_PAGE_DIR).to_string_lossy().to_string(),
        prerequisite_dir: base_dir
            .join(PREREQUISITE_DIR)
            .to_string_lossy()
            .to_string(),
        project_file: "".to_string(),
        project_name: "".to_string(),
        resource_dir: base_dir
            .join(RESOURCES_DIR)
            .to_string_lossy()
            .to_string(),
    }
}
