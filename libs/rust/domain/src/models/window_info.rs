use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowInfo {
    pub title: String,
    pub width: f64,
    pub height: f64,
    pub start_page: String,
    pub always_on_top: bool,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowInfos {
    pub installer_window: WindowInfo,
    pub uninstaller_window: WindowInfo,
}
