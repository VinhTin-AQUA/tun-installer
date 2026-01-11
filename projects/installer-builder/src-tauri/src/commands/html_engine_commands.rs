use crate::{models::HtmlPage, services::load_html_pages};
use tauri::command;

#[tauri::command]
pub async fn load_html_pages_command() -> Result<Option<Vec<HtmlPage>>, String> {
    let pages = load_html_pages().await.map_err(|e| e.to_string());
    return pages;
}

#[tauri::command]
pub async fn preview_installer_ui_command(app: tauri::AppHandle, width: f64, height: f64) {
    // let webview_window =
    tauri::WebviewWindowBuilder::new(
        &app,
        "label",
        tauri::WebviewUrl::App("/preview-installer-ui".into()),
    )
    .title("Preview Page")
    .inner_size(width, height)
    .resizable(false)
    .fullscreen(false)
    .decorations(true)
    .transparent(false)
    .always_on_top(false)
    .center()
    .visible(true)
    .skip_taskbar(false)
    .build()
    .unwrap();
}
