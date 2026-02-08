use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct FolderNode {
    pub id: String,
    pub name: String,
    pub children: Option<Vec<FolderNode>>,
    pub expanded: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileItem {
    pub id: String,
    pub folder_id: String,
    pub name: String,
    pub size: u64,
    #[serde(rename = "type")] 
    pub file_type: String,
    pub physical_path: String,
}
