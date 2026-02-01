use crate::{
    consts::event_consts,
    events::send_progress_event,
    helpers::copy_dir_all,
    models::InstallerDocument,
    states::{app_state::AppState},
};
use shared_lib::{Progress, RESOURCES_DIR};
use std::{env, path::PathBuf};
use tauri::{command, AppHandle, State};
use tokio::sync::Mutex;

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

    let resource_path_buf = exe_path_buf.clone().join(RESOURCES_DIR);

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
        PathBuf::from(installer_document.properties.installation_location.clone());
    _ = copy_dir_all(&resource_path_buf, &installation_location)
        .await
        .map_err(|e| e.to_string());

    // installer prerequisites
    // run_installer(
    //     "C:/Users/tinhv/Downloads/exe_template.exe",
    //     "/S",
    //     true,
    // )?;

    // registering registry
    // create_registry();

    // create shortcut
    // create_shortcuts(
    //     "AppName",                                      // tên shortcut
    //     r"C:\Users\tinhv\Downloads\exe_template.exe", // file chạy
    //     None,                                         // arguments
    //     Some(r"C:\Users\tinhv\Downloads\exe_template.exe"), // icon
    //                                                   // Some(r"C:\Users\tinhv\Desktop\labtest-offline-setup\build\out\icon.ico") // icon
    // )?;

    // call clean.exe to clean temp

    Ok(true)
}

//====================================================

// cmd: /install /quiet /norestart /D="C:\Program Files\App"
// crate: shlex = "1"
#[cfg(target_os = "windows")]
fn run_exe_installer_file(path: &str, arg_input: &str, run_as_admin: bool) -> Result<bool, String> {
    let args = parse_args(arg_input);

    if run_as_admin {
        let arg_list = args.join(" ");

        Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Start-Process '{}' -ArgumentList '{}' -Verb runAs",
                    path, arg_list
                ),
            ])
            .spawn()
            .map_err(|e| e.to_string())?
            .wait()
            .map_err(|e| e.to_string())?;
    } else {
        Command::new(path)
            .args(args)
            .spawn()
            .map_err(|e| e.to_string())?
            .wait()
            .map_err(|e| e.to_string())?;
    }

    Ok(true)
}

// parse input args
fn parse_args(input: &str) -> Vec<String> {
    shlex::split(input).unwrap_or_default()
}
