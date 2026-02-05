use crate::models::{InstallerProperties, Prerequisite, RegistryKeys, WindowInfo};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerDocument {
    pub properties: InstallerProperties,
    pub registry_keys: RegistryKeys,
    pub window_info: WindowInfo,
    pub prerequisites: Vec<Prerequisite>,
}
