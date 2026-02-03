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

#[cfg(target_os = "linux")]
pub mod registry_service_linux;

#[cfg(target_os = "linux")]
pub use registry_service_linux::*;

#[cfg(target_os = "linux")]
pub mod shortcut_servivce_linux;

#[cfg(target_os = "linux")]
pub use shortcut_servivce_linux::*;
