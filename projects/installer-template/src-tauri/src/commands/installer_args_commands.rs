use tauri::{command, State};
use tokio::sync::Mutex;

use crate::states::InstallerArgs;

#[command]
pub async fn get_installer_args_command(
    state: State<'_, Mutex<InstallerArgs>>,
) -> Result<InstallerArgs, String> {
    let state = state.lock().await;

    Ok(InstallerArgs {
        status: state.status.clone(),
    })
}
