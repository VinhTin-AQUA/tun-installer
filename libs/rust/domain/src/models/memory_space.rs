use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MemorySpace {
    pub volume_space_required: String,
    pub volume_space_available: String,
    pub volume_space_remaining: String,
}
