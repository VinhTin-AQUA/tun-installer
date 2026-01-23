```rs
//=============
// nén và giải nén theo stream

/*

DYNAMIC INSTALLER / SELF-EXTRACTING ARCHIVE

    - 1 file EXE duy nhất
    - Nhúng nhiều thư mục tài nguyên (configs, pages, resources, prerequisites…)
    - Không load toàn bộ vào , sử dụng streaming
    - Tốc độ nén/giải nén nhanh
    - Cho phép extract từng phần theo phase
    - Khi mở exe → extract configs/pages (UI)
    - Khi click Install → extract resources (payload lớn)

KIẾN TRÚC CUỐI CÙNG (MULTI-STREAM)

    [ EXE gốc ]
    [ ZSTD stream: configs        ]
    [ ZSTD stream: pages          ]
    [ ZSTD stream: resources      ]
    [ ZSTD stream: prerequisites  ]
    [ INDEX (bincode) ]
    [ MAGIC ]
    [ INDEX_SIZE (u64) ]

    Đặc điểm
        Mỗi thư mục = 1 stream độc lập
        Các stream không phụ thuộc nhau
        Có thể seek chính xác tới stream cần

    Format dữ liệu trong mỗi [ ZSTD stream ]

        [ path_len u32 ]
        [ path bytes ]
        [ file_size u64 ]
        [ file bytes ]
        (repeat)

        Extract đọc tuần tự

    [ INDEX (bincode) ]
        Metadata mô tả các stream đã nhúng

        struct StreamEntry {
            root: String,          // "configs", "resources", ...
            offset: u64,           // vị trí bắt đầu stream trong exe
            compressed_size: u64,  // độ dài stream nén
        }

        Tìm đúng stream
        Seek chính xác
        Không cần scan toàn

    [ MAGIC ]
        Một chuỗi byte cố định, ví dụ: const MAGIC: &[u8] = b"EMBED_ZSTD_MULTI_V1";

        Nhận diện file	Có phải exe có embedded data không
        Tránh đọc nhầm	Không cố parse exe thường
        Versioning	Cho phép nâng cấp format
        An toàn	Tránh crash / undefined behavior

    [ INDEX_SIZE (u64) ]
        8 byte cuối file
        Giá trị little-endian
        Cho biết index dài bao nhiêu byte
        Ví dụ: INDEX_SIZE = 512

    Khi extract
        Bước 1: Tìm INDEX_SIZE
            seek(End - 8)
            read u64
            -> Luôn đọc được, không cần biết gì trước.

        Bước 2: Kiểm tra
            seek(End - 8 - MAGIC.len())
            read MAGIC
            -> Xác nhận file có đúng format hay không.

        Bước 3: Đọc INDEX
            index_pos = End - 8 - MAGIC.len() - INDEX_SIZE
            seek(index_pos)
            read INDEX_SIZE bytes
            -> Đọc chính xác index để lấy thông tin của các stream đã nhúng, dễ dàng chọn stream để extract




THƯ VIỆN CRATES CẦN THIẾT

    [dependencies]
    walkdir = "2"
    serde = { version = "1", features = ["derive"] }
    bincode = "1"
    anyhow = "1"
    zstd = "0.13"

*/
//=============

use anyhow::*;
use serde::{Deserialize, Serialize};
use std::io;
use std::time::Instant;
use std::{
    fs::{File, OpenOptions},
    io::{BufReader, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};
use walkdir::WalkDir;
use zstd::stream::Decoder;
use zstd::stream::Encoder;

const MAGIC: &[u8] = b"EMBED_ZSTD_MULTI_V1";

// fn main() -> Result<()> {
//     let start = Instant::now();
//     println!("START");

//     let _ = compress();
//     let _ = extract();

//     let duration = start.elapsed();
//     println!("END: {:?}", duration);

//     Ok(())
// }

fn compress() -> Result<()> {
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from("data/exe_template.exe");

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
    let exe = PathBuf::from("data/exe_template.exe");

    // ======= AUTO EXTRACT =======
    extract_root(&exe, Path::new("output"), "resources")?;
    extract_root(&exe, Path::new("output"), "configs")?;
    extract_root(&exe, Path::new("output"), "prerequisites")?;
    extract_root(&exe, Path::new("output"), "pages")?;

    // ======= ON BUTTON CLICK =======
    // extract_root(&exe, Path::new("output"), "resources")?;
    // extract_root(&exe, Path::new("output"), "prerequisites")?;

    Ok(())
}

/*===============================*/

#[derive(Serialize, Deserialize)]
struct StreamEntry {
    root: String,
    offset: u64,
    compressed_size: u64,
    uncompressed_size: u64,
}

#[derive(Serialize, Deserialize)]
struct ArchiveIndex {
    streams: Vec<StreamEntry>,
}

pub fn embed_folders_into_exe(exe_path: &Path, folders: &[PathBuf]) -> Result<()> {
    let mut exe = OpenOptions::new().read(true).write(true).open(exe_path)?;
    exe.seek(SeekFrom::End(0))?;

    let mut index = ArchiveIndex {
        streams: Vec::new(),
    };

    for folder in folders {
        let root = folder.file_name().unwrap().to_string_lossy().to_string();
        let stream_start = exe.stream_position()?;
        let mut encoder = Encoder::new(&mut exe, 3)?;

        // tính tổng dung lượng file trong 1 folder
        let mut total_uncompressed_size: u64 = 0;
        for entry in WalkDir::new(folder).min_depth(1) {
            let entry = entry?;
            if entry.file_type().is_file() {
                let size = entry.metadata()?.len();
                total_uncompressed_size += size;
            }
        }
        let mut file_sizes: u64 = 0;
        let mut file_size_threshold: u64 = 1;

        // embed
        for entry in WalkDir::new(folder).into_iter().filter_map(Result::ok) {
            if entry.file_type().is_file() {
                let path = entry.path();
                let rel = path.strip_prefix(folder)?;
                let rel_path = format!("{}/{}", root, rel.to_string_lossy().replace('\\', "/"));

                // --- write path ---
                let path_bytes = rel_path.as_bytes();
                encoder.write_all(&(path_bytes.len() as u32).to_le_bytes())?;
                encoder.write_all(path_bytes)?;

                // --- write file size ---
                let mut f = File::open(path)?;
                let size = f.metadata()?.len(); // size of file (byte)

                encoder.write_all(&size.to_le_bytes())?;

                // --- write file data ---
                io::copy(&mut f, &mut encoder)?;
                file_sizes += size;

                if file_sizes >= (file_size_threshold * 5 * 1024 * 1024) {
                    progressbar(&root, &file_sizes, &total_uncompressed_size);
                    file_size_threshold += 1;
                }
            }
        }

        encoder.finish()?;
        let stream_end = exe.stream_position()?;
        index.streams.push(StreamEntry {
            root,
            offset: stream_start,
            compressed_size: stream_end - stream_start,
            uncompressed_size: total_uncompressed_size,
        });
    }

    // ---- write index ----
    let index_bytes = bincode::serialize(&index)?;
    exe.write_all(&index_bytes)?;
    exe.write_all(MAGIC)?;
    exe.write_all(&(index_bytes.len() as u64).to_le_bytes())?;

    Ok(())
}

fn read_index_from_exe(exe_path: &Path) -> Result<ArchiveIndex> {
    let mut exe = File::open(exe_path)?;
    let exe_size = exe.metadata()?.len();

    // ---- read index size ----
    exe.seek(SeekFrom::End(-8))?;
    let mut size_buf = [0u8; 8];
    exe.read_exact(&mut size_buf)?;
    let index_size = u64::from_le_bytes(size_buf);

    // ---- read magic ----
    let magic_len = MAGIC.len() as i64;
    exe.seek(SeekFrom::End(-(8 + magic_len)))?;
    let mut magic_buf = vec![0u8; MAGIC.len()];
    exe.read_exact(&mut magic_buf)?;

    ensure!(magic_buf == MAGIC, "Invalid archive magic");

    // ---- read index ----
    let index_pos = exe_size - 8 - MAGIC.len() as u64 - index_size;
    exe.seek(SeekFrom::Start(index_pos))?;

    let mut index_buf = vec![0u8; index_size as usize];
    exe.read_exact(&mut index_buf)?;

    Ok(bincode::deserialize(&index_buf)?)
}

pub fn extract_root(exe_path: &Path, output: &Path, target_root: &str) -> Result<()> {
    let index = read_index_from_exe(exe_path)?;
    let stream = index
        .streams
        .iter()
        .find(|s| s.root == target_root)
        .context("stream not found")?;

    let mut exe = File::open(exe_path)?;
    exe.seek(SeekFrom::Start(stream.offset))?;
    let compressed = exe.take(stream.compressed_size);

    let decoder = Decoder::new(compressed)?;
    let mut reader = BufReader::new(decoder);

    // for progress bar
    let total_uncompressed_size: u64 = stream.uncompressed_size;
    let mut file_sizes: u64 = 0;
    let mut file_size_threshold: u64 = 1;

    loop {
        let mut len_buf = [0u8; 4];
        if reader.read_exact(&mut len_buf).is_err() {
            break;
        }

        let path_len = u32::from_le_bytes(len_buf) as usize;
        let mut path_buf = vec![0u8; path_len];
        reader.read_exact(&mut path_buf)?;
        let rel_path = String::from_utf8_lossy(&path_buf);

        let mut size_buf = [0u8; 8];
        reader.read_exact(&mut size_buf)?;
        let size = u64::from_le_bytes(size_buf);

        let out_path = output.join(rel_path.as_ref());
        if let Some(p) = out_path.parent() {
            std::fs::create_dir_all(p)?;
        }

        let mut out = File::create(out_path)?;
        let copied = io::copy(&mut reader.by_ref().take(size), &mut out)?;

        file_sizes += copied;
        if file_sizes > (file_size_threshold * 5 * 1024 * 1024) {
            progressbar(
                &target_root.to_string(),
                &file_sizes,
                &total_uncompressed_size,
            );
            file_size_threshold += 1;
        }
    }

    Ok(())
}

fn progressbar(rel_path: &String, file_sizes: &u64, total_size: &u64) {
    if total_size == &0 {
        return;
    }
    // println!("rel_path = {:?}", rel_path);

    // println!("total_size = {:?}", total_size);
    // println!("file_sizes = {:?}", file_sizes);

    let percent = (*file_sizes as f64 / *total_size as f64) * 100.0;
    println!("{:?} = {:.2}%", rel_path, percent);
}

// SỬ DỤNG ZSTD RẤT NAHNH VÀ ĐANG LOAD TOÀN BỘ DỮ LIỆU VÀO RAM
/*

/*
[EXE]
[ZSTD STREAM]  <── nén 1 lần
  [u32 path_len][path bytes]
  [u64 file_size]
  [file bytes]
  ...
[INDEX]        <── bincode
[MAGIC]
[INDEX_SIZE]
*/


use anyhow::*;
use lzma_rs::lzma_compress;
use lzma_rs::lzma_decompress;
use serde::{Deserialize, Serialize};
use std::time::Instant;
use std::{
    fs::{File, OpenOptions},
    io::{BufReader, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};
use walkdir::WalkDir;
use zstd::stream::Encoder;
use zstd::stream::Decoder;

const MAGIC: &[u8] = b"EMBED_LZMA_V1";

fn main() -> Result<()> {
    let start = Instant::now();
    println!("START");

    // let _ = compress();
    let _ = extract();

    let duration = start.elapsed();
    println!("END: {:?}", duration);

    Ok(())
}

fn compress() -> Result<()> {
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from("data/exe_template.exe");

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
    let exe = PathBuf::from("data/exe_template.exe");

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
    exe.seek(SeekFrom::End(0))?;

    let mut index = ArchiveIndex { entries: Vec::new() };
    let mut raw = Vec::with_capacity(512 * 1024 * 1024);
    let mut cursor = 0u64;

    for folder in folders {
        let root = folder.file_name().unwrap().to_string_lossy().to_string();

        for entry in WalkDir::new(folder) {
            let entry = entry?;
            let path = entry.path();
            let rel = path.strip_prefix(folder)?;
            let rel = rel.to_string_lossy().replace('\\', "/");

            if entry.file_type().is_dir() {
                index.entries.push(IndexEntry {
                    root: root.clone(),
                    relative_path: rel,
                    kind: EntryKind::Dir,
                });
                continue;
            }

            let path_bytes = rel.as_bytes();
            raw.extend_from_slice(&(path_bytes.len() as u32).to_le_bytes());
            raw.extend_from_slice(path_bytes);

            let size = entry.metadata()?.len();
            raw.extend_from_slice(&size.to_le_bytes());

            let start = cursor;
            cursor += 4 + path_bytes.len() as u64 + 8 + size;

            File::open(path)?.read_to_end(&mut raw)?;

            index.entries.push(IndexEntry {
                root: root.clone(),
                relative_path: rel,
                kind: EntryKind::File {
                    offset: start,
                    compressed_size: size,
                },
            });
        }
    }

    let start = exe.stream_position()?;
    let mut encoder = Encoder::new(&mut exe, 3)?; // level 3 = rất nhanh
    encoder.write_all(&raw)?;
    encoder.finish()?;
    let end = exe.stream_position()?;

    println!("Zstd compressed size: {}", end - start);

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
    let (index, index_pos) = read_index_from_exe(exe_path)?;
    let mut exe = File::open(exe_path)?;

    exe.seek(SeekFrom::Start(0))?;
    let compressed = exe.take(index_pos);

    let mut decoded = Vec::new();
    Decoder::new(compressed)?.read_to_end(&mut decoded)?;

    let mut cur = 0usize;

    for entry in index.entries.iter().filter(|e| e.root == target_root) {
        let out = output_dir.join(&entry.root).join(&entry.relative_path);

        match entry.kind {
            EntryKind::Dir => {
                std::fs::create_dir_all(&out)?;
            }
            EntryKind::File { .. } => {
                let path_len = u32::from_le_bytes(decoded[cur..cur+4].try_into()?) as usize;
                cur += 4;
                let path = &decoded[cur..cur+path_len];
                cur += path_len;

                let size = u64::from_le_bytes(decoded[cur..cur+8].try_into()?) as usize;
                cur += 8;

                if String::from_utf8_lossy(path) == entry.relative_path {
                    if let Some(p) = out.parent() {
                        std::fs::create_dir_all(p)?;
                    }
                    File::create(&out)?.write_all(&decoded[cur..cur+size])?;
                }

                cur += size;
            }
        }
    }

    Ok(())
}

*/
//=====================================================

// NÉN VÀ GIẢI NÉN THEO STREAM
/*

/*

DYNAMIC INSTALLER / SELF-EXTRACTING ARCHIVE

    - 1 file EXE duy nhất
    - Nhúng nhiều thư mục tài nguyên (configs, pages, resources, prerequisites…)
    - Không load toàn bộ vào , sử dụng streaming
    - Tốc độ nén/giải nén nhanh
    - Cho phép extract từng phần theo phase
    - Khi mở exe → extract configs/pages (UI)
    - Khi click Install → extract resources (payload lớn)

KIẾN TRÚC CUỐI CÙNG (MULTI-STREAM)

    [ EXE gốc ]
    [ ZSTD stream: configs        ]
    [ ZSTD stream: pages          ]
    [ ZSTD stream: resources      ]
    [ ZSTD stream: prerequisites  ]
    [ INDEX (bincode) ]
    [ MAGIC ]
    [ INDEX_SIZE (u64) ]

    Đặc điểm
        Mỗi thư mục = 1 stream độc lập
        Các stream không phụ thuộc nhau
        Có thể seek chính xác tới stream cần

    Format dữ liệu trong mỗi [ ZSTD stream ]

        [ path_len u32 ]
        [ path bytes ]
        [ file_size u64 ]
        [ file bytes ]
        (repeat)

        Extract đọc tuần tự

    [ INDEX (bincode) ]
        Metadata mô tả các stream đã nhúng

        struct StreamEntry {
            root: String,          // "configs", "resources", ...
            offset: u64,           // vị trí bắt đầu stream trong exe
            compressed_size: u64,  // độ dài stream nén
        }

        Tìm đúng stream
        Seek chính xác
        Không cần scan toàn

    [ MAGIC ]
        Một chuỗi byte cố định, ví dụ: const MAGIC: &[u8] = b"EMBED_ZSTD_MULTI_V1";

        Nhận diện file	Có phải exe có embedded data không
        Tránh đọc nhầm	Không cố parse exe thường
        Versioning	Cho phép nâng cấp format
        An toàn	Tránh crash / undefined behavior

    [ INDEX_SIZE (u64) ]
        8 byte cuối file
        Giá trị little-endian
        Cho biết index dài bao nhiêu byte
        Ví dụ: INDEX_SIZE = 512

    Khi extract
        Bước 1: Tìm INDEX_SIZE
            seek(End - 8)
            read u64
            -> Luôn đọc được, không cần biết gì trước.

        Bước 2: Kiểm tra
            seek(End - 8 - MAGIC.len())
            read MAGIC
            -> Xác nhận file có đúng format hay không.

        Bước 3: Đọc INDEX
            index_pos = End - 8 - MAGIC.len() - INDEX_SIZE
            seek(index_pos)
            read INDEX_SIZE bytes
            -> Đọc chính xác index để lấy thông tin của các stream đã nhúng, dễ dàng chọn stream để extract




THƯ VIỆN CRATES CẦN THIẾT

    [dependencies]
    walkdir = "2"
    serde = { version = "1", features = ["derive"] }
    bincode = "1"
    anyhow = "1"
    zstd = "0.13"


*/

use anyhow::*;
use serde::{Deserialize, Serialize};
use std::io;
use std::time::Instant;
use std::{
    fs::{File, OpenOptions},
    io::{BufReader, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};
use walkdir::WalkDir;
use zstd::stream::Decoder;
use zstd::stream::Encoder;

const MAGIC: &[u8] = b"EMBED_ZSTD_MULTI_V1";

fn main() -> Result<()> {
    let start = Instant::now();
    println!("START");

    // let _ = compress();
    let _ = extract();

    let duration = start.elapsed();
    println!("END: {:?}", duration);

    Ok(())
}

fn compress() -> Result<()> {
    // let exe = std::env::current_exe()?;
    let exe = PathBuf::from("data/exe_template.exe");

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
    let exe = PathBuf::from("data/exe_template.exe");

    // ======= AUTO EXTRACT =======
    extract_root(&exe, Path::new("output"), "resources")?;
    extract_root(&exe, Path::new("output"), "configs")?;
    extract_root(&exe, Path::new("output"), "prerequisites")?;
    extract_root(&exe, Path::new("output"), "pages")?;

    // ======= ON BUTTON CLICK =======
    // extract_root(&exe, Path::new("output"), "resources")?;
    // extract_root(&exe, Path::new("output"), "prerequisites")?;

    Ok(())
}

/*===============================*/

#[derive(Serialize, Deserialize)]
struct StreamEntry {
    root: String,
    offset: u64,
    compressed_size: u64,
}

#[derive(Serialize, Deserialize)]
struct ArchiveIndex {
    streams: Vec<StreamEntry>,
}

pub fn embed_folders_into_exe(exe_path: &Path, folders: &[PathBuf]) -> Result<()> {
    let mut exe = OpenOptions::new().read(true).write(true).open(exe_path)?;

    exe.seek(SeekFrom::End(0))?;

    let mut index = ArchiveIndex {
        streams: Vec::new(),
    };

    for folder in folders {
        let root = folder.file_name().unwrap().to_string_lossy().to_string();

        let stream_start = exe.stream_position()?;

        let mut encoder = Encoder::new(&mut exe, 3)?;

        for entry in WalkDir::new(folder).into_iter().filter_map(Result::ok) {
            if entry.file_type().is_file() {
                let path = entry.path();
                let rel = path.strip_prefix(folder)?;

                let rel_path = format!("{}/{}", root, rel.to_string_lossy().replace('\\', "/"));

                println!("rel_path = {:?}", rel_path);

                // --- write path ---
                let path_bytes = rel_path.as_bytes();
                encoder.write_all(&(path_bytes.len() as u32).to_le_bytes())?;
                encoder.write_all(path_bytes)?;

                // --- write file size ---
                let mut f = File::open(path)?;
                let size = f.metadata()?.len();
                encoder.write_all(&size.to_le_bytes())?;

                // --- write file data ---
                io::copy(&mut f, &mut encoder)?;
            }
        }

        encoder.finish()?;

        let stream_end = exe.stream_position()?;

        index.streams.push(StreamEntry {
            root,
            offset: stream_start,
            compressed_size: stream_end - stream_start,
        });
    }

    // ---- write index ----
    let index_bytes = bincode::serialize(&index)?;
    exe.write_all(&index_bytes)?;
    exe.write_all(MAGIC)?;
    exe.write_all(&(index_bytes.len() as u64).to_le_bytes())?;

    Ok(())
}

fn read_index_from_exe(exe_path: &Path) -> Result<ArchiveIndex> {
    let mut exe = File::open(exe_path)?;
    let exe_size = exe.metadata()?.len();

    // ---- read index size ----
    exe.seek(SeekFrom::End(-8))?;
    let mut size_buf = [0u8; 8];
    exe.read_exact(&mut size_buf)?;
    let index_size = u64::from_le_bytes(size_buf);

    // ---- read magic ----
    let magic_len = MAGIC.len() as i64;
    exe.seek(SeekFrom::End(-(8 + magic_len)))?;
    let mut magic_buf = vec![0u8; MAGIC.len()];
    exe.read_exact(&mut magic_buf)?;

    ensure!(magic_buf == MAGIC, "Invalid archive magic");

    // ---- read index ----
    let index_pos = exe_size - 8 - MAGIC.len() as u64 - index_size;
    exe.seek(SeekFrom::Start(index_pos))?;

    let mut index_buf = vec![0u8; index_size as usize];
    exe.read_exact(&mut index_buf)?;

    Ok(bincode::deserialize(&index_buf)?)
}

pub fn extract_root(exe_path: &Path, output: &Path, target_root: &str) -> Result<()> {
    println!("extract_root");
    let index = read_index_from_exe(exe_path)?;

    println!("read_index_from_exe");
    let stream = index
        .streams
        .iter()
        .find(|s| s.root == target_root)
        .context("stream not found")?;

    let mut exe = File::open(exe_path)?;
    exe.seek(SeekFrom::Start(stream.offset))?;
    let compressed = exe.take(stream.compressed_size);

    let decoder = Decoder::new(compressed)?;
    let mut reader = BufReader::new(decoder);

    loop {
        let mut len_buf = [0u8; 4];
        if reader.read_exact(&mut len_buf).is_err() {
            break;
        }

        let path_len = u32::from_le_bytes(len_buf) as usize;
        let mut path_buf = vec![0u8; path_len];
        reader.read_exact(&mut path_buf)?;
        let rel_path = String::from_utf8_lossy(&path_buf);

        println!("rel_path = {:?}", rel_path);

        let mut size_buf = [0u8; 8];
        reader.read_exact(&mut size_buf)?;
        let size = u64::from_le_bytes(size_buf);

        let out_path = output.join(rel_path.as_ref());
        if let Some(p) = out_path.parent() {
            std::fs::create_dir_all(p)?;
        }

        let mut out = File::create(out_path)?;
        io::copy(&mut reader.by_ref().take(size), &mut out)?;
    }

    Ok(())
}

*/
//=====================================================

```
