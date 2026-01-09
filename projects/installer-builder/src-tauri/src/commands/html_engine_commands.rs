use crate::{models::HtmlPage, services::load_html_pages};
use tauri::command;

#[tauri::command]
pub async fn load_html_pages_command() -> Result<Option<Vec<HtmlPage>>, String> {
    let pages = load_html_pages().await.map_err(|e| e.to_string());
    return pages;
}
