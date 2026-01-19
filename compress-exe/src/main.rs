use anyhow::*;
use lzma_rs::lzma_compress;
use lzma_rs::lzma_decompress;
use serde::{Deserialize, Serialize};
use std::{
    fs::{File, OpenOptions},
    io::{self, BufReader, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};
use walkdir::WalkDir;

const MAGIC: &[u8] = b"EMBED_LZMA_V1";

fn main() -> Result<()> {
    let _ = compress();
    // let _ = extract();

    Ok(())
}

fn compress() -> Result<()> {
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from("/media/newtun/Data/Dev/custom installer/template.exe");

    // ======= EMBED (build-time hoặc tool riêng) =======
    embed_folders_into_exe(
        &exe,
        &[
            "data/pages".into(),
            "data/configs".into(),
            "data/prerequisites".into(),
            "data/resources".into(),
        ],
    )?;

    Ok(())
}

fn extract() -> Result<()> {
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from("/media/newtun/Data/Dev/custom installer/template.exe");

    // ======= AUTO EXTRACT =======
    extract_folder_from_exe(&exe, Path::new("output"), "resources")?;
    extract_folder_from_exe(&exe, Path::new("output"), "configs")?;
    extract_folder_from_exe(&exe, Path::new("output"), "prerequisites")?;
    extract_folder_from_exe(&exe, Path::new("output"), "pages")?;

    // ======= ON BUTTON CLICK =======
    // extract_folder_from_exe(&exe, Path::new("output"), "resources")?;
    // extract_folder_from_exe(&exe, Path::new("output"), "prerequisites")?;

    Ok(())
}

/*===============================*/

#[derive(Serialize, Deserialize, Debug)]
enum EntryKind {
    File { offset: u64, compressed_size: u64 },
    Dir,
}

#[derive(Serialize, Deserialize, Debug)]
struct IndexEntry {
    root: String,
    relative_path: String,
    kind: EntryKind,
}

#[derive(Serialize, Deserialize, Debug)]
struct ArchiveIndex {
    entries: Vec<IndexEntry>,
}

pub fn embed_folders_into_exe(exe_path: &Path, folders: &[PathBuf]) -> Result<()> {
    let mut exe = OpenOptions::new().read(true).write(true).open(exe_path)?;

    // SEEK TỚI CUỐI FILE TRƯỚC KHI GHI
    exe.seek(SeekFrom::End(0))?;

    let mut index = ArchiveIndex {
        entries: Vec::new(),
    };

    for folder in folders {
        let root_name = folder.file_name().unwrap().to_string_lossy().to_string();

        for entry in WalkDir::new(folder).min_depth(0) {
            let entry = entry?;
            let path = entry.path();
            let rel = path.strip_prefix(folder)?;
            let rel_str = rel.to_string_lossy().to_string();

            // LOG
            if rel_str.is_empty() {
                println!("Embedding {}/", root_name);
            } else {
                println!("Embedding {}/{}", root_name, rel_str.replace('\\', "/"));
            }

            if entry.file_type().is_dir() {
                index.entries.push(IndexEntry {
                    root: root_name.clone(),
                    relative_path: rel_str,
                    kind: EntryKind::Dir,
                });
            } else {
                let input = File::open(path)?;
                // let mut reader = std::io::BufReader::new(input);

                // chunk size: 512KB
                let mut reader = BufReader::with_capacity(512 * 1024, input);

                let start = exe.stream_position()?;

                lzma_compress(&mut reader, &mut exe)?;

                let end = exe.stream_position()?;

                index.entries.push(IndexEntry {
                    root: root_name.clone(),
                    relative_path: rel_str,
                    kind: EntryKind::File {
                        offset: start,
                        compressed_size: end - start,
                    },
                });
            }
        }
    }

    let index_bytes = bincode::serialize(&index)?;
    exe.write_all(&index_bytes)?;
    exe.write_all(MAGIC)?;
    exe.write_all(&(index_bytes.len() as u64).to_le_bytes())?;

    Ok(())
}

fn read_index_from_exe(exe_path: &Path) -> Result<(ArchiveIndex, u64)> {
    let mut exe = File::open(exe_path)?;
    let exe_size = exe.metadata()?.len();

    // đọc index_size
    exe.seek(SeekFrom::End(-8))?;
    let mut size_buf = [0u8; 8];
    exe.read_exact(&mut size_buf)?;
    let index_size = u64::from_le_bytes(size_buf);

    // đọc magic
    exe.seek(SeekFrom::End(-(8 + MAGIC.len() as i64)))?;
    let mut magic_buf = vec![0u8; MAGIC.len()];
    exe.read_exact(&mut magic_buf)?;

    ensure!(magic_buf == MAGIC, "No embedded data");

    // đọc index
    let index_pos = exe_size - 8 - MAGIC.len() as u64 - index_size;
    exe.seek(SeekFrom::Start(index_pos))?;

    let mut index_bytes = vec![0u8; index_size as usize];
    exe.read_exact(&mut index_bytes)?;

    let index = bincode::deserialize(&index_bytes)?;

    Ok((index, index_pos))
}

pub fn extract_folder_from_exe(
    exe_path: &Path,
    output_dir: &Path,
    target_root: &str,
) -> Result<()> {
    let (index, _) = read_index_from_exe(exe_path)?;
    let mut exe = File::open(exe_path)?;



    println!("{:?}", index.entries);

    for entry in index.entries.iter().filter(|e| e.root == target_root) {
        let display_path = if entry.relative_path.is_empty() {
            format!("{}/", entry.root)
        } else {
            format!("{}/{}", entry.root, entry.relative_path)
        };

        println!("Extracting {}", display_path);

        let out_path = output_dir.join(&entry.root).join(&entry.relative_path);

        match &entry.kind {
            EntryKind::Dir => {
                std::fs::create_dir_all(&out_path)?;
            }
            EntryKind::File {
                offset,
                compressed_size,
            } => {
                // 🔴 FIX QUAN TRỌNG
                if let Some(parent) = out_path.parent() {
                    std::fs::create_dir_all(parent)?;
                }

                exe.seek(SeekFrom::Start(*offset))?;

                let reader = (&mut exe as &mut dyn Read).take(*compressed_size);
                // let mut buf_reader = BufReader::new(reader);

                // chunk size: 256KB
                let mut buf_reader = BufReader::with_capacity(256 * 1024, reader);

                let mut out = File::create(&out_path)?;
                lzma_decompress(&mut buf_reader, &mut out)?;
            }
        }
    }

    Ok(())
}

/*==== progressbar ====*/
