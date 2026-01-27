use crate::{
    models::HtmlPage,
    services::{load_html_first_time_install_pages, load_html_maintenance_pages},
};
use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder, command};

#[command]
pub async fn load_html_first_time_install_pages_command(
    project_dir: String,
) -> Result<Option<Vec<HtmlPage>>, String> {
    let pages = load_html_first_time_install_pages(project_dir)
        .await
        .map_err(|e| e.to_string());
    return pages;
}

#[command]
pub async fn load_html_maintenance_pages_command(
    project_dir: String,
) -> Result<Option<Vec<HtmlPage>>, String> {
    let pages = load_html_maintenance_pages(project_dir)
        .await
        .map_err(|e| e.to_string());
    return pages;
}

#[command]
pub async fn preview_installer_ui_command(app: AppHandle, width: f64, height: f64) {
    // let webview_window =
    WebviewWindowBuilder::new(
        &app,
        "label",
        WebviewUrl::App("/preview-installer-ui".into()),
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
    .closable(true)
    .minimizable(true)
    .build()
    .unwrap();
}
