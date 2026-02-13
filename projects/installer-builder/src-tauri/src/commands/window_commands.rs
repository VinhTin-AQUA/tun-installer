use tauri::Window;

#[tauri::command]
pub fn close_current_window(window: Window) {
    println!("close_current_window");
    window.close().unwrap();
}
