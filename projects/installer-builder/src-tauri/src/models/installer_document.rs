use crate::models::{InstallerProperties, RegistryKeys, WindowInfo};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerDocument {
    pub properties: InstallerProperties,
    pub registry_keys: RegistryKeys,
    pub window_info: WindowInfo
}
