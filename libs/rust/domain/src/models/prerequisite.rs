use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstallPhase {
    Before,
    After,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Prerequisite {
    pub name: String,
    pub run_as_admin: bool,
    pub install_phase: InstallPhase,
    pub size: f64,
}
