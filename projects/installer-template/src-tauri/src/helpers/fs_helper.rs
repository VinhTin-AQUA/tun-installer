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
