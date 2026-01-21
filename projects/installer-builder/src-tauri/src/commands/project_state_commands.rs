use std::sync::Mutex;

use crate::states::WorkingConfigState;
use tauri::{command, State};

#[command]
pub fn update_project_state_command(
    state: State<'_, Mutex<WorkingConfigState>>,
    data: WorkingConfigState,
) -> Result<Option<bool>, String> {
    let mut state = state.lock().unwrap();

    state.config_dir = data.config_dir;
    state.page_dir = data.page_dir;
    state.prerequisite_dir = data.prerequisite_dir;
    state.resource_dir = data.resource_dir;

    state.config_file = data.config_file;
    state.project_file = data.project_file;
    state.project_dir = data.project_dir;

    state.is_dirty = data.is_dirty;
    Ok(Some(true))
}

#[command]
pub fn load_project_state_command(
    state: State<'_, Mutex<WorkingConfigState>>,
) -> Result<Option<WorkingConfigState>, String> {
    let state: std::sync::MutexGuard<'_, WorkingConfigState> = state.lock().unwrap();
    Ok(Some(WorkingConfigState {
        config_dir: state.config_dir.clone(),
        page_dir: state.page_dir.clone(),
        prerequisite_dir: state.prerequisite_dir.clone(),
        resource_dir: state.resource_dir.clone(),

        config_file: state.config_file.clone(),
        project_file: state.project_file.clone(),
        project_dir: state.project_dir.clone(),

        is_dirty: state.is_dirty.clone(),
    }))
}
