use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};

// pub trait ResourceExt {
//     fn resource(&self, path: &str) -> tauri::Result<std::path::PathBuf>;
// }

// impl ResourceExt for AppHandle {
//     fn resource(&self, path: &str) -> tauri::Result<std::path::PathBuf> {
//         self.path().resolve(path, BaseDirectory::Resource)
//     }
// }

// #[tauri::command]
// fn do_something(app: AppHandle) -> Result<(), String> {
//     let rcedit_path = app.resource("resources/rcedit.exe")
//         .map_err(|e| e.to_string())?;

//     println!("{:?}", rcedit_path);

//     Ok(())
// }

pub fn resource_path(app: &AppHandle, file_name: &str) -> tauri::Result<std::path::PathBuf> {
    let path = format!("resources/{}", file_name);
    app.path().resolve(path, BaseDirectory::Resource)
}

pub fn get_rcedit_res(app: &AppHandle) -> tauri::Result<std::path::PathBuf> {
    let path = format!("resources/rcedit.exe");
    app.path().resolve(path, BaseDirectory::Resource)
}

pub fn get_exe_template_res(app: &AppHandle) -> tauri::Result<std::path::PathBuf> {
    let path = format!("resources/exe_template_v1.0.0.exe");
    app.path().resolve(path, BaseDirectory::Resource)
}
