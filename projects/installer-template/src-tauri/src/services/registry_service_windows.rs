use anyhow::Result;
use winreg::enums::*;
use winreg::RegKey;

use crate::enums::ERegValue;

// create_registry
pub fn create_registry(app_name: &str) -> Result<()> {
    // Mở HKEY_LOCAL_MACHINE
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Ghép đường dẫn với tên key truyền vào
    let subkey_path = format!(
        "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}",
        app_name
    );

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (_key, _) = hklm.create_subkey(subkey_path)?;

    Ok(())
}

// remove key

pub fn remove_registry() -> Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    hkcu.delete_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;
    Ok(())
}

// add value
pub fn add_values(app_name: &str, values: &[(&str, ERegValue)]) -> Result<()> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    let subkey_path = format!(
        "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}",
        app_name
    );

    let (key, _) = hklm.create_subkey(subkey_path)?;

    for (name, value) in values {
        match value {
            ERegValue::Str(v) => key.set_value(name, v)?,
            ERegValue::U32(v) => key.set_value(name, v)?,
            ERegValue::U64(v) => key.set_value(name, v)?,
            ERegValue::Bool(v) => {
                let int_val: u32 = if *v { 1 } else { 0 };
                key.set_value(name, &int_val)?;
            }
        }
    }

    println!("Đã ghi registry thành công!");
    Ok(())
}

// add_values(
//     "AAAA",
//     &[
//         ("Username", ERegValue::Str("Alice")),
//         ("LaunchCount", ERegValue::U32(1)),
//         ("TotalTime", ERegValue::U64(123456)),
//         ("Enabled", ERegValue::Bool(true)),
//     ],
// )?;

// read value
pub fn read_value() -> Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;

    let val: u32 = key.get_value("LaunchCount")?;

    println!("LaunchCount = {:?}", val);
    Ok(())
}

// remove value
pub fn remove_value() -> Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;

    key.delete_value("LaunchCount")?;
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
