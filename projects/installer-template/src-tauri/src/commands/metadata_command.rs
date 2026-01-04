use metadata::{read_data_from_exe, UIPage};
use tauri::command;

#[command]
pub async fn read_data_from_exe_command() -> Result<UIPage, String> {
    let ui_page = read_data_from_exe().await.map_err(|e| e.to_string());

    ui_page
}
