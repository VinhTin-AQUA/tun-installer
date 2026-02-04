use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RegistryValueType {
    #[serde(rename = "REG_NONE")]
    None,
    #[serde(rename = "REG_SZ")]
    Sz,
    #[serde(rename = "REG_EXPAND_SZ")]
    ExpandSz,
    #[serde(rename = "REG_DWORD")]
    Dword,
    #[serde(rename = "REG_QWORD")]
    Qword,
    #[serde(rename = "REG_BINARY")]
    Binary,
    #[serde(rename = "REG_MULTI_SZ")]
    MultiSz,
}

// #[derive(Debug, Clone, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub enum RegistryValueData {
//     String(String),
//     Number(u64), // dùng u64 cho DWORD/QWORD
//     StringArray(Vec<String>),
//     Null,
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistryValue {
    pub name: String, // eg: "ProductName"
    #[serde(rename = "type")]
    pub value_type: RegistryValueType, // eg: RegistryValueType::Sz
    pub data: String, // eg: RegistryValueData::String("Tun Installer".into())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistryKey {
    pub path: String, // eg: "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
    pub values: Vec<RegistryValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistryKeys {
    pub config_registry: RegistryKey,
    pub uninstall_registry: RegistryKey,
}
