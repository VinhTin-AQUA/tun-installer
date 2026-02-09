use tauri::Window;

#[tauri::command]
pub fn close_current_window(window: Window) {
    window.close().unwrap();
}
