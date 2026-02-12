use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectState {
    pub config_dir: String,
    pub page_dir: String,
    pub prerequisite_dir: String,
    pub resource_dir: String,

    pub config_file: String,
    pub project_file: String,
    pub project_dir: String,
    pub project_name: String,

    pub is_dirty: bool,
}
