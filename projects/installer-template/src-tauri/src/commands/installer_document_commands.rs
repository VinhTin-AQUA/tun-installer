use domain::InstallerDocument;
use tauri::{command, State};
use tokio::sync::Mutex;


#[command]
pub async fn get_installer_document_command(
    state: State<'_, Mutex<InstallerDocument>>,
) -> Result<Option<InstallerDocument>, String> {
    let state = state.lock().await;

    Ok(Some(InstallerDocument {
        properties: state.properties.clone(),
        registry_keys: state.registry_keys.clone(),
        window_infos: state.window_infos.clone(),
        prerequisites: state.prerequisites.clone(),
    }))
}
