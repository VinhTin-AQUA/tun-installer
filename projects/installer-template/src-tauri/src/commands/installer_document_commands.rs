use domain::InstallerDocumentConfig;
use tauri::{command, State};
use tokio::sync::Mutex;

#[command]
pub async fn get_installer_document_command(
    state: State<'_, Mutex<InstallerDocumentConfig>>,
) -> Result<Option<InstallerDocumentConfig>, String> {
    let state = state.lock().await;

    Ok(Some(InstallerDocumentConfig {
        properties: state.properties.clone(),
        registry_keys: state.registry_keys.clone(),
        window_infos: state.window_infos.clone(),
        prerequisites: state.prerequisites.clone(),
        memory_space: state.memory_space.clone(),
    }))
}
