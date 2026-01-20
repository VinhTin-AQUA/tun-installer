use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TunInstallerProject {
    pub name: String,
    pub created_date: String,
}
