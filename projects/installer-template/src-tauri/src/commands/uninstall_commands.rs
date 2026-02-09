use std::process::Command;

use domain::InstallerDocument;
use tauri::{command, State};
use tokio::sync::Mutex;

use crate::{
    helpers::clear_dir_best_effort,
    services::{remove_registry, remove_shortcuts},
};

#[command]
pub async fn uninstall_command(
    installer_document_state: State<'_, Mutex<InstallerDocument>>,
) -> Result<bool, String> {
    let installer_document = installer_document_state.lock().await;
    let app_dir = installer_document.clone().properties.installation_location;
    let registries = installer_document.registry_keys.clone();
    let properties = installer_document.properties.clone();

    let forbidden = [
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\Users",
    ];

    // do not delete system folder
    if forbidden.iter().any(|f| app_dir.eq_ignore_ascii_case(f)) {
        return Ok(false);
    }

    // Kill app
    let app_exe_name = &installer_document.properties.product_name;
    let _ = Command::new("taskkill")
        .args(["/IM", app_exe_name, "/F", "/T"])
        .status();

    // delete application folder
    let _ = clear_dir_best_effort(app_dir.clone())
        .await
        .map_err(|x| x.to_string());

    // delete registry
    remove_registry(registries.config_registry.path).unwrap();
    remove_registry(registries.uninstall_registry.path).unwrap();

    // delete shortcut
    let _ = remove_shortcuts(&properties.product_name);

    // Spawn cmd to delete app folder after exit
    let cmd = format!(
        r#"/C ping 127.0.0.1 -n 3 > nul && rmdir /s /q "{}""#,
        app_dir
    );

    let _ = Command::new("cmd")
        .args(["/C", &cmd])
        .spawn()
        .map_err(|x| x.to_string());

    Ok(true)
}

#[command]
pub async fn clean_uninstall_command(
    installer_document_state: State<'_, Mutex<InstallerDocument>>,
) -> Result<bool, String> {
    let installer_document = installer_document_state.lock().await;
    let app_dir = installer_document.clone().properties.installation_location;

    let forbidden = [
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\Users",
    ];

    // do not delete system folder
    if forbidden.iter().any(|f| app_dir.eq_ignore_ascii_case(f)) {
        return Ok(false);
    }

    // Kill app
    let app_exe_name = &installer_document.properties.product_name;
    let _ = Command::new("taskkill")
        .args(["/IM", app_exe_name, "/F", "/T"])
        .status();

    // Spawn cmd to delete app folder after exit
    let cmd = format!(
        r#"/C ping 127.0.0.1 -n 3 > nul && rmdir /s /q "{}""#,
        app_dir
    );

    let _ = Command::new("cmd")
        .args(["/C", &cmd])
        .spawn()
        .map_err(|x| x.to_string());

    Ok(true)
}
