use std::{
    io,
    path::{Path, PathBuf},
    process::Command,
};

use tokio::fs;

pub async fn copy_file_to_dir(
    source: impl AsRef<Path>,
    target_dir: impl AsRef<Path>,
    new_file_name: impl AsRef<Path>,
) -> io::Result<u64> {
    let source = source.as_ref();
    let target_dir = target_dir.as_ref();
    let new_file_name = new_file_name.as_ref();

    fs::create_dir_all(target_dir).await?;

    if new_file_name.components().count() != 1 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "new_file_name must be a file name only",
        ));
    }

    let destination: PathBuf = target_dir.join(new_file_name);
    fs::copy(source, &destination).await
}

pub async fn rename_file_keep_dir(old_path: &Path, new_file_name: &str) -> io::Result<()> {
    // Lấy thư mục cha
    let parent_dir = old_path
        .parent()
        .ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Không tìm thấy thư mục cha"))?;

    // Tạo đường dẫn mới = thư mục cũ + tên file mới
    let new_path: PathBuf = parent_dir.join(new_file_name);

    fs::rename(old_path, new_path).await
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

//=============== exe ===============

pub fn set_exe_icon(rcedit_path: &Path, exe_path: &Path, icon_path: &Path) -> Result<(), String> {
    let status = Command::new(rcedit_path)
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

pub fn get_current_exe() -> PathBuf {
    let exe_path_buf = std::env::current_exe().expect("Không lấy được đường dẫn file exe");
    // let exe_path_buf = PathBuf::from(
    //     "C:\\Users\\tinhv\\Desktop\\f\\tun-installer\\examples\\first-app\\output\\First App.exe",
    // );

    exe_path_buf
}
