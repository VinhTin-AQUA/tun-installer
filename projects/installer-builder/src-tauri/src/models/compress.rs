use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct StreamEntry {
    pub root: String,
    pub offset: u64,
    pub compressed_size: u64,
    pub uncompressed_size: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ArchiveIndex {
    pub streams: Vec<StreamEntry>,
}
