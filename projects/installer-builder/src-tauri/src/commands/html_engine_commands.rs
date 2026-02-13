use domain::HtmlPage;
use service::{load_html_first_time_install_pages, load_html_maintenance_pages};
use tauri::{command, AppHandle, State, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;

use crate::states::ProjectState;

#[command]
pub async fn load_html_first_time_install_pages_command(
    project_state: State<'_, Mutex<ProjectState>>,
) -> Result<Option<Vec<HtmlPage>>, String> {
    let project_state = project_state.lock().await;

    let pages = load_html_first_time_install_pages(project_state.project_dir.clone())
        .await
        .map_err(|e| e.to_string());
    return pages;
}

#[command]
pub async fn load_html_maintenance_pages_command(
    project_state: State<'_, Mutex<ProjectState>>,
) -> Result<Option<Vec<HtmlPage>>, String> {
    let project_state = project_state.lock().await;
    let pages = load_html_maintenance_pages(project_state.project_dir.clone())
        .await
        .map_err(|e| e.to_string());
    return pages;
}

#[command]
pub async fn preview_installer_ui_command(
    app: AppHandle,
    page_type: String,
    width: f64,
    height: f64,
) {
    // let webview_window =
    WebviewWindowBuilder::new(
        &app,
        "preview-window",
        WebviewUrl::App(format!("/preview-installer-ui?pageType={}", page_type).into()),
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
