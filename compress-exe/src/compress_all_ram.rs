use lzma_rs::lzma_compress;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{OpenOptions, create_dir_all, write};
use std::io::Cursor;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

const MAGIC: &[u8] = b"EMBED_LZMA_V1";

fn main() {
    // compress();
    extract();
}

fn compress() {
    // let exe = env::current_exe().unwrap();
    let exe = PathBuf::from("/media/newtun/Data/Dev/custom installer/template.exe");

    let exe_path = exe.to_string_lossy();

    // ==== DEMO NHÚNG (chỉ chạy 1 lần khi build tool) ====
    let mut all = Vec::new();
    all.extend(collect_entries("data/pages".as_ref(), "pages"));
    all.extend(collect_entries("data/configs".as_ref(), "configs"));
    all.extend(collect_entries(
        "data/prerequisites".as_ref(),
        "prerequisites",
    ));
    all.extend(collect_entries("data/resources".as_ref(), "resources"));


    let compressed = compress_entries(&all);
    embed_into_exe(&exe_path, &compressed);
}

fn extract() {
    // let exe = env::current_exe().unwrap();
    let exe = PathBuf::from("/media/newtun/Data/Dev/custom installer/template.exe");

    let exe_path = exe.to_string_lossy();

    // ==== DEMO GIẢI NÉN ====
    let entries = extract_embedded_data(&exe_path);

    println!("{:?}", entries.len());

    for e in &entries {
        println!("path = {:?}, is_dir = {:?}", e.path, e.is_dir)
    }

    // Auto extract khi chạy
    extract_entries(&entries, "output", &["pages", "configs", "prerequisites", "resources"]);

    // Giả lập click button
    // extract_entries(&entries, "output", &["prerequisites", "resources"]);
}

/*============================================*/

#[derive(Serialize, Deserialize)]
struct Entry {
    path: String,
    is_dir: bool,
    data: Option<Vec<u8>>,
}

fn collect_entries(base: &Path, prefix: &str) -> Vec<Entry> {
    let mut entries = Vec::new();

    for entry in WalkDir::new(base).min_depth(0) {
        let entry = entry.unwrap();
        let path = entry.path();

        let relative = path.strip_prefix(base).unwrap();
        let rel = relative.to_string_lossy();

        let full_path = if rel.is_empty() {
            prefix.to_string()
        } else {
            format!("{}/{}", prefix, rel)
        };

        if entry.file_type().is_dir() {
            entries.push(Entry {
                path: full_path,
                is_dir: true,
                data: None,
            });
        } else {
            entries.push(Entry {
                path: full_path,
                is_dir: false,
                data: Some(std::fs::read(path).unwrap()),
            });
        }
    }

    entries
}

fn compress_entries(entries: &Vec<Entry>) -> Vec<u8> {
    let serialized = bincode::serialize(entries).unwrap();

    let mut compressed = Vec::new();
    lzma_compress(&mut Cursor::new(serialized), &mut compressed).unwrap();
    compressed
}

fn embed_into_exe(exe_path: &str, compressed: &[u8]) {
    let mut file = OpenOptions::new().append(true).open(exe_path).unwrap();

    file.write_all(compressed).unwrap();
    file.write_all(MAGIC).unwrap();
    file.write_all(&(compressed.len() as u64).to_le_bytes())
        .unwrap();
}

fn extract_embedded_data(exe_path: &str) -> Vec<Entry> {
    let mut file = std::fs::File::open(exe_path).unwrap();
    let file_size = file.metadata().unwrap().len();

    file.seek(SeekFrom::End(-8)).unwrap();
    let mut size_buf = [0u8; 8];
    file.read_exact(&mut size_buf).unwrap();
    let data_size = u64::from_le_bytes(size_buf);

    file.seek(SeekFrom::End(-(8 + MAGIC.len() as i64))).unwrap();
    let mut magic_buf = vec![0u8; MAGIC.len()];
    file.read_exact(&mut magic_buf).unwrap();
    assert_eq!(magic_buf, MAGIC);

    file.seek(SeekFrom::End(-(8 + MAGIC.len() as i64 + data_size as i64)))
        .unwrap();
    let mut compressed = vec![0u8; data_size as usize];
    file.read_exact(&mut compressed).unwrap();

    let mut decompressed = Vec::new();
    lzma_rs::lzma_decompress(&mut Cursor::new(compressed), &mut decompressed).unwrap();

    bincode::deserialize(&decompressed).unwrap()
}

fn extract_entries(entries: &[Entry], target: &str, allowed: &[&str]) {
    // 1️⃣ Tạo toàn bộ thư mục trước
    for e in entries {
        if !allowed.iter().any(|a| e.path.starts_with(a)) {
            continue;
        }

        if e.is_dir {
            let full_path = format!("{}/{}", target, e.path);
            create_dir_all(&full_path).unwrap();
        }
    }

    // 2️⃣ Ghi file sau
    for e in entries {
        if !allowed.iter().any(|a| e.path.starts_with(a)) {
            continue;
        }

        if !e.is_dir {
            let full_path = format!("{}/{}", target, e.path);

            if let Some(parent) = std::path::Path::new(&full_path).parent() {
                create_dir_all(parent).unwrap();
            }

            write(&full_path, e.data.as_ref().unwrap()).unwrap();
        }
    }
}

