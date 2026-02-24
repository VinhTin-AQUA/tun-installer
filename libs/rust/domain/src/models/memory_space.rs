use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MemorySpace {
    pub volume_space_required: u64,
    pub volume_space_available: u64,
    pub volume_space_remaining: u64,
}
