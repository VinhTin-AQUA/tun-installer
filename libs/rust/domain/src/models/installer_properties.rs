use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerProperties {
    pub installation_location: String, // install location
    pub product_name: String,          // app name
    pub icon: String,                  // icon
    pub product_version: String,       // version
    pub publisher: String,             // publisher
    pub support_link: String,          // support link
    pub support_email: String,         // support email
    pub comment: String,               // comment
    pub launch_file: String,           // exe file
    pub run_as_admin: bool,            // run as administrator
    pub launch_app: bool,              // run app after install
    pub shortcut_in_desktop: ShortcutInDesktop,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutInDesktop {
    pub is_created: bool,
    pub run_as_admin: bool,
    pub shortcut_name: String,
}

