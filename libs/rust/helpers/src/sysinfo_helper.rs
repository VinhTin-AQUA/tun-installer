use std::{fs, io::Result, path::Path};
use sysinfo::Disks;

pub fn get_free_space_bytes(path: &Path) -> Option<u64> {
    let disks = Disks::new_with_refreshed_list();

    let mut best_match = None;
    let mut longest = 0;

    for disk in disks.list() {
        let mount = disk.mount_point();

        if path.starts_with(mount) {
            let len = mount.as_os_str().len();
            if len > longest {
                longest = len;
                best_match = Some(disk.available_space());
            }
        }
    }

    best_match
}

pub fn get_dir_size(path: &Path) -> Result<u64> {
    let mut total_size = 0;

    if path.is_file() {
        return Ok(path.metadata()?.len());
    }

    if path.is_dir() {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let entry_path = entry.path();

            if entry_path.is_dir() {
                total_size += get_dir_size(&entry_path)?;
            } else {
                total_size += entry.metadata()?.len();
            }
        }
    }

    Ok(total_size)
}

pub fn mb_to_gb(mb: f64) -> f64 {
    mb / 1024.0
}

pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = 1024 * 1024;
    const GB: u64 = 1024 * 1024 * 1024;
    const TB: u64 = 1024 * 1024 * 1024 * 1024;

    if bytes >= TB {
        format!("{:.2} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}
