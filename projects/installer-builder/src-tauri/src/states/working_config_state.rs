use serde::{Deserialize, Serialize};

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkingConfigState {
    pub content: String,
    pub file_path: String,
    pub is_dirty: bool,
}
