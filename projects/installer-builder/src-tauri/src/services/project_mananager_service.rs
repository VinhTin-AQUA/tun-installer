use crate::models::TunInstallerProject;
use anyhow::{anyhow, bail};
use chrono::Local;
use domain::{create_default_installer_document, CONFIG_DIR};
use helpers::to_pretty_xml;
use quick_xml::de::from_str;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use tokio::fs;

pub async fn create_tuninstaller_project(
    base_dir: String,
    project_name: String,
) -> anyhow::Result<bool> {
    let base_path = Path::new(base_dir.as_str()).join(project_name.clone());

    if base_path.exists() {
        bail!("Tên dự án đã tồn tại")
    }

    // Tạo thư mục gốc
    tokio::fs::create_dir_all(base_path.clone()).await?;

    // Tạo các thư mục con
    for dir in [
        "configs",
        "pages",
        "prerequisites",
        "resources",
        "pages/first-time-install",
        "pages/maintenance",
    ] {
        tokio::fs::create_dir_all(base_path.join(dir)).await?;
    }

    // Tạo dữ liệu XML
    let project = TunInstallerProject {
        name: project_name.clone(),
        created_date: Local::now().to_rfc3339(),
        project_dir: "./".to_string(),
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
    File::create(config_file_path.clone())?;

    let default_config = create_default_installer_document();
    let json = serde_json::to_string_pretty(&default_config)?;
    fs::write(
        config_file_path.to_string_lossy().to_string().as_str(),
        json,
    )
    .await?;

    Ok(true)
}

pub async fn open_tuninstaller_project(
    project_path: String,
) -> anyhow::Result<TunInstallerProject> {
    let project_path = PathBuf::from(project_path.as_str());

    let parent = project_path
        .parent()
        .ok_or_else(|| anyhow!("no parent directory"))?;

    let xml_content = tokio::fs::read_to_string(&project_path).await?;
    let mut project: TunInstallerProject = from_str(&xml_content)?;
    project.project_dir = parent.to_string_lossy().to_string();

    println!("{:#?}", project);

    Ok(project)
}
