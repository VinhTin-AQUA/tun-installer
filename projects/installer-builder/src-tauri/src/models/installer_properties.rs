use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerProperties {
    project_dir: String,
    installation_location: String, // install location
    product_name: String,          // app name
    icon: String,                  // icon
    product_version: String,       // version
    publisher: String,             // publisher
    support_link: String,          // support link
    support_email: String,         // support email
    comment: String,               // comment
    launch_file: String,           // exe file
    run_as_admin: bool,            // run as administrator
    launch_app: bool,              // run app after install
    shortcut_in_desktop: ShortcutInDesktop,
    shortcut_in_application_shortcut: ShortcutInApplicationShortcut,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutInDesktop {
    is_created: bool,
    run_as_admin: bool,
    shortcut_name: String,
    run_file: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutInApplicationShortcut {
    is_created: bool,
    run_as_admin: bool,
    shortcut_name: String,
    run_file: String,
}