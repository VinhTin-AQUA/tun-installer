use crate::{
    consts::event_consts,
    events::send_progress_event,
    helpers::copy_dir_all,
    states::{app_state::AppState, ProjectState},
};
use shared_lib::{Progress, RESOURCES_DIR};
use std::path::PathBuf;
use tauri::{command, AppHandle, State};
use tokio::sync::Mutex;

const EXTRACT_DIR: &str = "output";

#[command]
pub async fn install(
    app: AppHandle,
    app_state: State<'_, AppState>,
    project_state: State<'_, Mutex<ProjectState>>,
    folders: Vec<String>,
) -> Result<bool, String> {
    let project_state = project_state.lock().await;
    let compressor = app_state.compressor.clone();

    let base_dir: PathBuf =
        PathBuf::from("/media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app");

    // let exe_path_buf = std::env::current_exe()?;
    let exe_path_buf = base_dir.join("template.exe");
    let output_path_buf = base_dir.join(EXTRACT_DIR);
    let output_path_buf_2 = output_path_buf.clone().join(RESOURCES_DIR);

    println!(
        "exe_path_buf = {:?}",
        exe_path_buf.to_string_lossy().to_string()
    );

    // extract
    _ = tauri::async_runtime::spawn_blocking(move || {
        let r = compressor
            .extract_installer(
                output_path_buf.to_string_lossy().to_string(),
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
    let app_folder = base_dir.join("app_folder");
    _ = copy_dir_all(&output_path_buf_2, &app_folder)
        .await
        .map_err(|e| e.to_string());

    Ok(true)
}
