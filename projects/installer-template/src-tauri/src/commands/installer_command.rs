use std::{env, path::PathBuf};
use domain::{InstallerDocument, PREREQUISITE_DIR, RESOURCES_DIR, event_consts};
use service::Progress;
use tauri::{command, AppHandle, State};
use tokio::sync::Mutex;

use crate::{events::send_progress_event, helpers::copy_dir_all, services::{add_values, create_registry, create_shortcuts}, states::AppState};

#[command]
pub async fn install(
    app: AppHandle,
    app_state: State<'_, AppState>,
    installer_document_state: State<'_, Mutex<InstallerDocument>>,
    folders: Vec<String>,
) -> Result<bool, String> {
    let installer_document = installer_document_state.lock().await;
    let compressor = app_state.compressor.clone();

    // let base_dir: PathBuf =
    //     PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app");

    let temp_app_dir = env::temp_dir().join(installer_document.properties.product_name.clone());
    let exe_path_buf = std::env::current_exe().map_err(|e| e.to_string())?;
    // let exe_path_buf = PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app/template.exe");

    let resource_path_buf = temp_app_dir.clone().join(RESOURCES_DIR);
    let prerequisite_path_buf = temp_app_dir.clone().join(PREREQUISITE_DIR);

    // extract
    _ = tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(
                temp_app_dir.to_string_lossy().to_string(),
                folders,
                exe_path_buf,
            )
            .map_err(|e| e.to_string());
        r
    })
    .await
    .map_err(|e| e.to_string())?;

    // copy to app folder
    send_progress_event(
        app,
        event_consts::INSTALL,
        Progress {
            message: "Copy files to app folder...".to_string(),
            percent: 100.0,
        },
    );

    // copy to installation_location
    let installation_location =
        PathBuf::from(installer_document.properties.installation_location.clone())
            .join(installer_document.properties.publisher.clone())
            .join(installer_document.properties.product_name.clone());

    _ = copy_dir_all(&resource_path_buf, &installation_location)
        .await
        .map_err(|e| e.to_string());

    // installer prerequisites
    let prerequisites = installer_document.prerequisites.clone();
    for prerequisite in prerequisites {
        println!("Installing {}", prerequisite.name);

        let exe_path = prerequisite_path_buf
            .join(&prerequisite.name)
            .to_string_lossy()
            .to_string();

        run_exe_installer_file(exe_path, "/S", prerequisite.run_as_admin).await?;
    }

    // registering registry
    create_registry(&installer_document.properties.product_name.clone())
        .map_err(|e| e.to_string())?;

    add_values(&installer_document.registry_keys.config_registry).map_err(|e| e.to_string())?;
    add_values(&installer_document.registry_keys.uninstall_registry).map_err(|e| e.to_string())?;

    // create shortcut
    let run_app_file = installation_location.join(
        installation_location.join(
            installer_document
                .properties
                .shortcut_in_desktop
                .run_file
                .clone(),
        ),
    );
    let icon = installation_location.join(
        installer_document
            .properties
            .shortcut_in_desktop
            .run_file
            .clone(),
    );
    _ = create_shortcuts(
        &installer_document.properties.product_name.clone(), // tên shortcut
        &run_app_file.to_string_lossy().to_string(),
        None,
        Some(&icon.to_string_lossy().to_string()), // icon
                                                   // Some(r"C:\Users\tinhv\Desktop\labtest-offline-setup\build\out\icon.ico") // icon
    )
    .map_err(|x| x.to_string())?;

    // call clean.exe to clean temp

    Ok(true)
}

//====================================================

#[cfg(target_os = "linux")]
pub async fn run_exe_installer_file(
    path: String,
    arg_input: &str,
    run_as_admin: bool,
) -> Result<bool, String> {
    Ok(true)
}

// cmd: /install /quiet /norestart /D="C:\Program Files\App"
// crate: shlex = "1"
#[cfg(target_os = "windows")]
pub async fn run_exe_installer_file(
    path: String,
    arg_input: &str,
    run_as_admin: bool,
) -> Result<bool, String> {
    let arg_input = arg_input.to_string();

    tokio::task::spawn_blocking(move || {
        let args = parse_args(&arg_input);

        if run_as_admin {
            use std::process::Command;

            let arg_list = args.join(" ");

            Command::new("powershell")
                .args([
                    "-Command",
                    &format!(
                        "Start-Process '{}' -ArgumentList '{}' -Verb runAs -Wait",
                        path, arg_list
                    ),
                ])
                .spawn()
                .map_err(|e| e.to_string())?
                .wait()
                .map_err(|e| e.to_string())?;
        } else {
            use std::process::Command;

            Command::new(&path)
                .args(args)
                .spawn()
                .map_err(|e| e.to_string())?
                .wait()
                .map_err(|e| e.to_string())?;
        }

        Ok(true)
    })
    .await
    .map_err(|e| e.to_string())?
}

// parse input args
fn parse_args(input: &str) -> Vec<String> {
    shlex::split(input).unwrap_or_default()
}
