pub mod html_engine_service;
pub use html_engine_service::*;

#[cfg(target_os = "windows")]
pub mod registry_service_windows;

#[cfg(target_os = "windows")]
pub use registry_service_windows::*;

#[cfg(target_os = "windows")]
pub mod shortcut_servivce_windows;

#[cfg(target_os = "windows")]
pub use shortcut_servivce_windows::*;

pub mod registry_service_linux;
pub use registry_service_linux::*;

pub mod shortcut_servivce_linux;
pub use shortcut_servivce_linux::*;
