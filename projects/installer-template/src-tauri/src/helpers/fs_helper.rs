use std::path::Path;
use std::path::PathBuf;
use async_recursion::async_recursion;
use tokio::fs;
use tokio::io;

#[async_recursion]
pub async fn copy_dir_all(src: &Path, dst: &Path) -> io::Result<()> {
    fs::create_dir_all(dst).await?;

    let mut entries = fs::read_dir(src).await?;

    while let Some(entry) = entries.next_entry().await? {
        let ty = entry.file_type().await?;
        let dest_path: PathBuf = dst.join(entry.file_name());

        if ty.is_dir() {
            copy_dir_all(&entry.path(), &dest_path).await?;
        } else {
            fs::copy(entry.path(), dest_path).await?;
        }
    }

    Ok(())
}

pub async fn remove_dir_all<P: AsRef<Path>>(folder_path: P) -> io::Result<()>  {
    fs::remove_dir_all(folder_path).await?;
    Ok(())
}

// copy_dir_all(Path::new("A"), Path::new("B")).await?;

pub async fn clear_dir_best_effort<P: AsRef<Path>>(dir: P) -> io::Result<()> {
    let mut stack = Vec::new();
    stack.push(dir.as_ref().to_path_buf());

    while let Some(current_dir) = stack.pop() {
        let mut entries = match fs::read_dir(&current_dir).await {
            Ok(e) => e,
            Err(err) => {
                eprintln!("Không đọc được {:?}: {}", current_dir, err);
                continue;
            }
        };

        while let Ok(Some(entry)) = entries.next_entry().await {
            let path = entry.path();

            let res = async {
                let meta = fs::symlink_metadata(&path).await?;

                if meta.is_dir() {
                    stack.push(path.clone());
                } else {
                    fs::remove_file(&path).await?;
                }

                Ok::<(), io::Error>(())
            }
            .await;

            if let Err(err) = res {
                eprintln!("Bỏ qua {:?}: {}", path, err);
            }
        }

        // chỉ xóa dir sau khi đã xử lý xong nội dung
        if let Err(err) = fs::remove_dir(&current_dir).await {
            eprintln!("Không xóa được {:?}: {}", current_dir, err);
        }
    }

    Ok(())
}