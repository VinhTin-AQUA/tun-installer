use crate::states::ProjectState;
use tauri::{command, State};
use tokio::sync::Mutex;

#[command]
pub async fn get_project_state_command(
    state: State<'_, Mutex<ProjectState>>,
) -> Result<Option<ProjectState>, String> {
    let state = state.lock().await;
    Ok(Some(ProjectState {
        config_dir: state.config_dir.clone(),
        page_dir: state.page_dir.clone(),
        prerequisite_dir: state.prerequisite_dir.clone(),
        resource_dir: state.resource_dir.clone(),

        config_file: state.config_file.clone(),
        project_file: state.project_file.clone(),
        project_dir: state.project_dir.clone(),
        project_name: state.project_dir.clone(),

        is_dirty: state.is_dirty.clone(),
    }))
}
