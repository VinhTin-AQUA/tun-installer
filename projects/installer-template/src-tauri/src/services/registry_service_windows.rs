use winreg::enums::*;
use winreg::RegKey;

// create_registry
fn create_registry() -> io::Result<()> {
    // Mở HKEY_CURRENT_USER
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;
    return Ok(());
}

// remove key

pub fn remove_registry() -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    hkcu.delete_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;
}

// add value
pub fn add_value() -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;
    // Ghi giá trị string
    key.set_value("Username", &"Alice")?;

    // Ghi số nguyên
    key.set_value("LaunchCount", &1u32)?;

    println!("Đã ghi registry thành công!");
}

// read value
pub fn add_value() -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;

    let val: u32 = key.get_value("LaunchCount")?;

    println!("LaunchCount = {:?}", val);
}

// remove value
pub fn remove_value() -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Tạo (hoặc mở nếu đã tồn tại) key
    let (key, _) =
        hkcu.create_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AAAA")?;

    key.delete_value("LaunchCount")?;
}

// #[cfg(target_os = "windows")]
// fn do_something() {
//   println!("Windows logic");
// }

// #[cfg(target_os = "linux")]
// fn do_something() {
//   println!("Linux logic");
// }
