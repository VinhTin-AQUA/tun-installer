use anyhow::{bail, Result};
use domain::ERegValue;
use domain::RegistryKey;
use domain::RegistryValueType;
use winreg::enums::*;
use winreg::RegKey;

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
pub fn add_values(registry_key: &RegistryKey) -> Result<()> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Cắt bỏ HKEY_LOCAL_MACHINE\\
    let sub_path = registry_key.path.replace("HKEY_LOCAL_MACHINE\\", "");

    let (key, _) = hklm.create_subkey(sub_path)?;

    for value in &registry_key.values {
        let reg_value = map_to_ereg_value(&value.value_type, &value.data)?;

        match reg_value {
            ERegValue::Str(v) => key.set_value(&value.name, &v)?,
            ERegValue::U32(v) => key.set_value(&value.name, &v)?,
            ERegValue::U64(v) => key.set_value(&value.name, &v)?,
            ERegValue::Bool(v) => {
                let int_val: u32 = if v { 1 } else { 0 };
                key.set_value(&value.name, &int_val)?;
            }
        }
    }

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

fn map_to_ereg_value<'a>(value_type: &RegistryValueType, data: &'a str) -> Result<ERegValue<'a>> {
    Ok(match value_type {
        RegistryValueType::Sz | RegistryValueType::ExpandSz => ERegValue::Str(data),

        RegistryValueType::Dword => ERegValue::U32(data.parse::<u32>()?),

        RegistryValueType::Qword => ERegValue::U64(data.parse::<u64>()?),

        RegistryValueType::None => {
            bail!("REG_NONE không hỗ trợ ghi data")
        }

        RegistryValueType::Binary => {
            bail!("REG_BINARY chưa được hỗ trợ")
        }

        RegistryValueType::MultiSz => {
            bail!("REG_MULTI_SZ chưa được hỗ trợ")
        }
    })
}

// #[cfg(target_os = "windows")]
// fn do_something() {
//   println!("Windows logic");
// }

// #[cfg(target_os = "linux")]
// fn do_something() {
//   println!("Linux logic");
// }
