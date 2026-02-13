use std::process::Command;

use domain::{event_consts, InstallerDocument};
use service::Progress;
use std::env;
use tauri::{AppHandle, State, command};
use tokio::sync::Mutex;
use rand::Rng;

use crate::{
    events::send_progress_event,
    helpers::{clear_dir_best_effort, remove_dir_all},
    services::{remove_registry, remove_shortcuts},
};

#[command]
pub async fn uninstall_command(
    app: AppHandle,
    installer_document_state: State<'_, Mutex<InstallerDocument>>,
) -> Result<bool, String> {
    let installer_document = installer_document_state.lock().await;
    let app_dir = installer_document.clone().properties.installation_location;
    let registries = installer_document.registry_keys.clone();
    let properties = installer_document.properties.clone();
    let temp_app_dir = env::temp_dir().join(installer_document.properties.product_name.clone());
    let temp_app_dir_to_delete_temp_folder = temp_app_dir.clone();
    let forbidden = [
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\Users",
    ];
    let percent = generate_sorted_array();

    // do not delete system folder
    if forbidden.iter().any(|f| app_dir.eq_ignore_ascii_case(f)) {
        return Ok(false);
    }

    // Kill app
    send_progress_event(
        app.clone(),
        event_consts::INSTALL,
        Progress {
            message: "Stop app...".to_string(),
            percent: percent[0],
        },
    );

    let app_exe_name = &installer_document
        .properties
        .launch_file;
    let _ = Command::new("taskkill")
        .args(["/IM", app_exe_name, "/F", "/T"])
        .status();

    // delete application folder
    send_progress_event(
        app.clone(),
        event_consts::INSTALL,
        Progress {
            message: "Delete application folder...".to_string(),
            percent: percent[1],
        },
    );
    let _ = clear_dir_best_effort(app_dir.clone())
        .await
        .map_err(|x| x.to_string());

    // delete registry
    send_progress_event(
        app.clone(),
        event_consts::INSTALL,
        Progress {
            message: "Delete registry...".to_string(),
            percent: percent[2],
        },
    );
    remove_registry(registries.config_registry.path).unwrap();
    remove_registry(registries.uninstall_registry.path).unwrap();

    // delete shortcut
    send_progress_event(
        app.clone(),
        event_consts::INSTALL,
        Progress {
            message: "Delete shortcut...".to_string(),
            percent: percent[3],
        },
    );
    let _ = remove_shortcuts(&properties.product_name);
    _ = remove_dir_all(temp_app_dir_to_delete_temp_folder).await;

    // Spawn cmd to delete app folder after exit
    send_progress_event(
        app.clone(),
        event_consts::INSTALL,
        Progress {
            message: "Delete app folder after exit...".to_string(),
            percent: percent[4],
        },
    );
    let cmd = format!(
        r#"/C ping 127.0.0.1 -n 5 > nul && rmdir /s /q "{}""#,
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
    println!("Spawn cmd to delete app folder after exit");
    let cmd = format!(
        r#"/C ping 127.0.0.1 -n 5 > nul && rmdir /s /q "{}""#,
        app_dir
    );

    let _ = Command::new("cmd")
        .args(["/C", &cmd])
        .spawn()
        .map_err(|x| x.to_string());

    Ok(true)
}

fn generate_sorted_array() -> [f64; 5] {
    let mut rng = rand::thread_rng();
    let mut arr: [f64; 5] =
        std::array::from_fn(|_| rng.gen_range(0.0..=100.0));
    arr.sort_by(|a, b| a.partial_cmp(b).unwrap());

    arr
}
