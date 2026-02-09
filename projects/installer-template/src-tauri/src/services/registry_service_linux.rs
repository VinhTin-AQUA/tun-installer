use anyhow::Result;
use domain::RegistryKey;

// create_registry
pub fn create_registry(app_name: &str) -> Result<()> {
    return Ok(());
}

// remove key

pub fn remove_registry(key: String) -> Result<()> {
    Ok(())
}

// add value
pub fn add_values(registry_key: &RegistryKey) -> Result<()> {
    Ok(())
}

// read value
pub fn read_value() -> Result<()> {
    Ok(())
}

// remove value
pub fn remove_value() -> Result<()> {
    Ok(())
}

// #[cfg(target_os = "windows")]
// fn do_something() {
//   println!("Windows logic");
// }

// #[cfg(target_os = "linux")]
// fn do_something() {
//   println!("Linux logic");
// }
