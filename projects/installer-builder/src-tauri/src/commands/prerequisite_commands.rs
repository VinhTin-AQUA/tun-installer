use domain::Prerequisite;
use tauri::{command, State};
use tokio::sync::Mutex;

use crate::{services::get_prerequisites, states::ProjectState};

#[command]
pub async fn get_prerequisites_command(
    project_state: State<'_, Mutex<ProjectState>>,
) -> Result<Vec<Prerequisite>, String> {
    let project_state = project_state.lock().await;

    let pages = get_prerequisites(project_state.project_dir.clone())
        .await
        .map_err(|e| e.to_string())?;

    return Ok(pages);
}
