use crate::states::ProjectState;
use tauri::{command, State};
use tokio::sync::Mutex;

#[command]
pub async fn update_project_state_command(
    project_state: State<'_, Mutex<ProjectState>>,
    data: ProjectState,
) -> Result<Option<bool>, String> {
    let mut project_state = project_state.lock().await;

    project_state.config_dir = data.config_dir;
    project_state.page_dir = data.page_dir;
    project_state.prerequisite_dir = data.prerequisite_dir;
    project_state.resource_dir = data.resource_dir;

    project_state.config_file = data.config_file;
    project_state.project_file = data.project_file;
    project_state.project_dir = data.project_dir;

    project_state.is_dirty = data.is_dirty;
    Ok(Some(true))
}

#[command]
pub async fn load_project_state_command(
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
