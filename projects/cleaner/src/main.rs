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
    let source = "scripts.md";

    copy_file_to_dir(
        source,
        "backup/2026/02/11",
        "main.ts"
    ).await?;

    //======================

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