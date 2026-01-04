use metadata::write_data_to_exe;
use tauri::command;

#[command]
pub async fn write_data_to_exe_command(data: String) -> Result<bool, String> {
    let r = write_data_to_exe(data);
    r
}
