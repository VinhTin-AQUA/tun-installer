use crate::models::{InstallerProperties, RegistryKeys};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerDocumentConfig {
    pub properties: InstallerProperties,
    pub registry_keys: RegistryKeys,
}
