use anyhow::bail;
use chrono::Local;
use quick_xml::se::to_string;
use std::fmt::format;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;

use crate::consts::CONFIG_DIR;
use crate::helpers::to_pretty_xml;
use crate::models::TunInstallerProject;

pub fn create_tuninstaller_project(base_dir: String, project_name: String) -> anyhow::Result<bool> {
    let base_path = Path::new(base_dir.as_str()).join(project_name.clone());

    if base_path.exists() {
        bail!("Tên dự án đã tồn tại")
    }

    // Tạo thư mục gốc
    fs::create_dir_all(base_path.clone())?;

    // Tạo các thư mục con
    for dir in [
        "configs",
        "pages",
        "prerequisites",
        "resources",
        "pages/first-time-install",
        "pages/maintenance",
    ] {
        fs::create_dir_all(base_path.join(dir))?;
    }

    // Tạo dữ liệu XML
    let project = TunInstallerProject {
        name: project_name.clone(),
        created_date: Local::now().to_rfc3339(),
    };

    // Serialize sang XML
    let xml_body = to_pretty_xml(&project)?;

    let xml = format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
{}"#,
        xml_body
    );

    // Ghi file .tunins
    let file_path = base_path.join(format!("{}.tunins", project_name));
    let mut file = File::create(file_path)?;
    file.write_all(xml.as_bytes())?;

    let config_file_path = base_path.join(CONFIG_DIR).join("config.json");
    File::create(config_file_path)?;

    Ok(true)
}
