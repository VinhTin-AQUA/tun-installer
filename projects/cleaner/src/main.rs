use std::io;
use std::io::Read;
use std::path::Path;
use std::{env, path::PathBuf, process::Command};
use tokio::fs;

#[tokio::main]
async fn main() -> io::Result<()> {
    //======== run as admin
    // let temp = env::temp_dir();
    // println!("temp = {:?}", temp.to_string_lossy().to_string());
    // let t = PathBuf::from("value").join("").join("fsef");
    // println!("t = {:?}", t.to_string_lossy().to_string());
    // relaunch_as_admin();

    // let args: Vec<String> = env::args().collect();
    // let is_admin_instance = args.contains(&"--admin".to_string());

    // // 👇 BIẾN DUY NHẤT BẠN YÊU CẦU
    // let run_as_admin: bool = true; // đổi thành false để chạy normal

    // if run_as_admin {
    //     // Muốn chạy admin
    //     if !is_admin() {
    //         // Chưa có quyền → relaunch
    //         if !is_admin_instance {
    //             relaunch_as_admin();
    //         }
    //         return;
    //     }

    //     // Đã là admin
    //     admin_task();
    //     wait_for_key();
    // } else {
    //     // Chạy bình thường
    //     normal_task();
    // }
    //======================

    //=== copy file vao thu muc khac

    // let source = "scripts.md";

    // copy_file_to_dir(
    //     source,
    //     "backup/2026/02/11",
    //     "main.ts"
    // ).await?;

    //======================

    //=== doi icon

    // let exe_path = "C:/Users/tinhv/Downloads/test.exe";
    // let icon_path = "C:/Users/tinhv/Downloads/earth.ico";

    // set_exe_icon(exe_path, icon_path).unwrap();

    //======================

    //=== doi ten file

    // rename_file("C:/Users/tinhv/Downloads/test.exe", "new.exe").await?;
    // rename_file_keep_dir("C:/Users/tinhv/Downloads/test.exe", "new.exe").await?;

    //======================n

    Ok(())
}

fn normal_task() {
    println!("✅ Normal task executed");
}

fn admin_task() {
    println!("🔥 Admin task executed!");
    wait_for_key();
}

#[cfg(target_os = "windows")]
pub fn relaunch_as_admin() {
    let exe = env::current_exe().expect("Cannot get exe path");

    Command::new("powershell")
        .args([
            "-Command",
            &format!(
                "Start-Process '{}' -ArgumentList '--admin' -Verb RunAs",
                exe.display()
            ),
        ])
        .spawn()
        .expect("Failed to relaunch as admin");
}

#[cfg(target_os = "linux")]
pub fn relaunch_as_admin() {}

fn is_admin() -> bool {
    // Windows-specific admin check
    Command::new("net")
        .arg("session")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[cfg(windows)]
pub fn wait_for_key() {
    println!("\nPress ENTER to exit...");
    let _ = io::stdin().read(&mut [0u8]).unwrap();
}

#[cfg(target_os = "linux")]
pub fn wait_for_key() {}

pub async fn copy_file_to_dir(
    source: impl AsRef<Path>,
    target_dir: impl AsRef<Path>,
    new_file_name: impl AsRef<Path>,
) -> io::Result<u64> {
    let source = source.as_ref();
    let target_dir = target_dir.as_ref();
    let new_file_name = new_file_name.as_ref();

    // Tạo thư mục nhiều cấp nếu chưa tồn tại
    fs::create_dir_all(target_dir).await?;

    // Đảm bảo new_file_name chỉ là tên file, không phải path đầy đủ
    if new_file_name.components().count() != 1 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "new_file_name must be a file name only",
        ));
    }

    // Tạo đường dẫn đích
    let destination: PathBuf = target_dir.join(new_file_name);

    // Copy file
    fs::copy(source, &destination).await
}

fn set_exe_icon(exe_path: &str, icon_path: &str) -> Result<(), String> {
    let status = Command::new("C:/Users/tinhv/Desktop/f/tun-installer/rcedit.exe")
        .arg(exe_path)
        .arg("--set-icon")
        .arg(icon_path)
        .status()
        .map_err(|e| format!("Không chạy được rcedit: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err("rcedit chạy nhưng đổi icon thất bại".to_string())
    }
}

fn refresh_icon_cache() {
    Command::new("ie4uinit.exe")
        .arg("-ClearIconCache")
        .status()
        .ok();

    Command::new("ie4uinit.exe").arg("-show").status().ok();
}

pub async fn rename_file(old_path: &str, new_path: &str) -> io::Result<()> {
    if !Path::new(old_path).exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            "File nguồn không tồn tại",
        ));
    }

    fs::rename(old_path, new_path).await?;
    Ok(())
}

pub async fn rename_file_keep_dir(
    old_path: &str,
    new_file_name: &str,
) -> io::Result<()> {
    let old_path = Path::new(old_path);

    // Lấy thư mục cha
    let parent_dir = old_path
        .parent()
        .ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Không tìm thấy thư mục cha"))?;

    // Tạo đường dẫn mới = thư mục cũ + tên file mới
    let new_path: PathBuf = parent_dir.join(new_file_name);

    fs::rename(old_path, new_path).await
}
