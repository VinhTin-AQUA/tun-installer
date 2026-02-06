use crate::models::{
    InstallerProperties, Prerequisite, RegistryKey, RegistryKeys, RegistryValue, RegistryValueType,
    ShortcutInApplicationShortcut, ShortcutInDesktop, WindowInfo,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerDocument {
    pub properties: InstallerProperties,
    pub registry_keys: RegistryKeys,
    pub window_info: WindowInfo,
    pub prerequisites: Vec<Prerequisite>,
}

pub fn create_default_installer_document() -> InstallerDocument {
    InstallerDocument {
        properties: InstallerProperties {
            installation_location: "C:\\Program Files\\MyApp".into(),
            product_name: "My Application".into(),
            icon: "icon.ico".into(),
            product_version: "1.0.0".into(),
            publisher: "My Company".into(),
            support_link: "https://support.mycompany.com".into(),
            support_email: "support@mycompany.com".into(),
            comment: "Default installer comment".into(),
            launch_file: "myapp.exe".into(),
            run_as_admin: false,
            launch_app: true,
            shortcut_in_desktop: ShortcutInDesktop {
                is_created: true,
                run_as_admin: false,
                shortcut_name: "My Application".into(),
                run_file: "myapp.exe".into(),
            },
            shortcut_in_application_shortcut: ShortcutInApplicationShortcut {
                is_created: true,
                run_as_admin: false,
                shortcut_name: "My Application".into(),
                run_file: "myapp.exe".into(),
            },
        },

        registry_keys: RegistryKeys {
            config_registry: RegistryKey {
                path: "HKEY_LOCAL_MACHINE\\SOFTWARE\\MyCompany\\MyApp".into(),
                values: vec![
                    RegistryValue {
                        name: "InstallPath".into(),
                        value_type: RegistryValueType::Sz,
                        data: "C:\\Program Files\\MyCompany\\MyApp".into(),
                        default: true,
                    },
                    RegistryValue {
                        name: "Version".into(),
                        value_type: RegistryValueType::Sz,
                        data: "1.0.0".into(),
                        default: true,
                    },
                     RegistryValue {
                        name: "DisplayName".into(),
                        value_type: RegistryValueType::Sz,
                        data: "MyApp".into(),
                        default: true,
                    },
                ],
            },
            uninstall_registry: RegistryKey {
                path: "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\MyApp".into(),
                values: vec![
                    RegistryValue {
                        name: "DisplayName".into(),
                        value_type: RegistryValueType::Sz,
                        data: "My Application".into(),
                        default: true,
                    },
                    RegistryValue {
                        name: "Publisher".into(),
                        value_type: RegistryValueType::Sz,
                        data: "My Company".into(),
                        default: true,
                    },

                       RegistryValue {
                        name: "DisplayVersion".into(),
                        value_type: RegistryValueType::Sz,
                        data: "1.0.0".into(),
                        default: true,
                    },

                       RegistryValue {
                        name: "UninstallString".into(),
                        value_type: RegistryValueType::Sz,
                        data: "C:\\Program Files\\MyCompany\\MyApp\\uninstall.exe".into(),
                        default: true,
                    },
                ],
            },
        },

        window_info: WindowInfo {
            title: "My Application Installer".into(),
            width: 800.0,
            height: 600.0,
            start_page: "welcome.html".into(),
            always_on_top: false,
        },

        prerequisites: vec![],
    }
}
