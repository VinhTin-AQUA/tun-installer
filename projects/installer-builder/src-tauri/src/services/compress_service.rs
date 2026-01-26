use anyhow::*;
use serde::Serialize;
use std::io;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::{
    fs::{File, OpenOptions},
    io::{BufReader, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};
use walkdir::WalkDir;
use zstd::stream::Decoder;
use zstd::stream::Encoder;

use crate::models::{ArchiveIndex, StreamEntry};

//======== model ========

// compress lib
#[derive(Clone, Serialize)]
pub struct Progress {
    pub percent: f64,
    pub message: String,
}

pub trait CompressProgressReporter: Send + Sync {
    fn report(&self, progress: Progress);
}

pub struct Compressor<R: CompressProgressReporter> {
    reporter: R,
    cancelled: Arc<AtomicBool>,
}

//================

const MAGIC: &[u8] = b"EMBED_ZSTD_MULTI_V1";

impl<R: CompressProgressReporter> Compressor<R> {
    pub fn new(reporter: R) -> Self {
        Self {
            reporter,
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn compress_installer(&self, folders: Vec<String>) -> Result<bool> {
        _ = self.un_cancel();

        // let exe = std::env::current_exe()?;
        let exe = PathBuf::from(
            "C:/Users/tinhv/Desktop/f/tun-installer/examples/app/template.exe",
        );
        let folders: Vec<PathBuf> = folders.iter().map(|p| p.into()).collect();

        let r = self.embed_folders_into_exe(&exe, &folders);

        r
    }

    pub fn extract_installer(&self, output: String, folders: Vec<String>) -> Result<bool> {
        _ = self.un_cancel();

        // let exe = std::env::current_exe()?;
        let exe = PathBuf::from("data/exe_template.exe");

        // ======= AUTO EXTRACT =======
        for folder in folders {
            self.extract_root(&exe, Path::new(output.as_str()), &folder)?;
        }

        // ======= ON BUTTON CLICK =======
        // self.extract_root(&exe, Path::new("output"), "resources")?;
        // self.extract_root(&exe, Path::new("output"), "prerequisites")?;

        Ok(true)
    }

    pub fn cancel(&self) -> Result<()> {
        self.cancelled.store(true, Ordering::SeqCst);
        Ok(())
    }

    pub fn un_cancel(&self) -> Result<()> {
        self.cancelled.store(false, Ordering::SeqCst);
        Ok(())
    }

    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::SeqCst)
    }

    //====================

    fn embed_folders_into_exe(&self, exe_path: &Path, folders: &[PathBuf]) -> Result<bool> {
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
                if self.cancelled.load(Ordering::Relaxed) {
                    return Err(anyhow::anyhow!("Compression cancelled by user"));
                }

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
                        self.progressbar(
                            &root,
                            &file_sizes,
                            &total_uncompressed_size,
                            format!("Embeding data {}", rel.to_string_lossy()),
                        );
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

        Ok(true)
    }

    fn read_index_from_exe(&self, exe_path: &Path) -> Result<ArchiveIndex> {
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

    fn extract_root(&self, exe_path: &Path, output: &Path, target_root: &str) -> Result<bool> {
        let index = self.read_index_from_exe(exe_path)?;
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
            if self.cancelled.load(Ordering::Relaxed) {
                return Err(anyhow::anyhow!("Extract cancelled by user"));
            }

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
                self.progressbar(
                    &target_root.to_string(),
                    &file_sizes,
                    &total_uncompressed_size,
                    format!("Extracting {}...", target_root),
                );
                file_size_threshold += 1;
            }
        }

        Ok(true)
    }

    fn progressbar(&self, rel_path: &String, file_sizes: &u64, total_size: &u64, message: String) {
        if total_size == &0 {
            return;
        }
        // println!("rel_path = {:?}", rel_path);
        // println!("total_size = {:?}", total_size);
        // println!("file_sizes = {:?}", file_sizes);

        let percent = (*file_sizes as f64 / *total_size as f64) * 100.0;
        println!("{:?} = {:.2}%", rel_path, percent);

        self.reporter.report(Progress {
            percent: percent,
            message: message,
        });
    }
}

/* test */

// fn madin() -> Result<()> {
//     let start = std::time::Instant::now();
//     println!("START");

//     let _ = compress();
//     let _ = extract();

//     let duration = start.elapsed();
//     println!("END: {:?}", duration);

//     Ok(())
// }

/* usage */

// Implement ProgressReporter

// use compression_lib::progress::ProgressReporter;
// use tauri::AppHandle;

// struct TauriProgressReporter {
//     app: AppHandle,
// }

// impl ProgressReporter for TauriProgressReporter {
//     fn report(&self, percent: u8) {
//         let _ = self.app.emit_all("compress-progress", percent);
//     }
// }

// Command

// #[tauri::command]
// fn compress_command(app: tauri::AppHandle) -> Result<(), String> {
//     let reporter = TauriProgressReporter { app };
//     let compressor = compression_lib::compressor::Compressor::new(reporter);

//     compressor.compress("input.zip", "output.zip")?;
//     Ok(())
// }

// client

// import { listen } from "@tauri-apps/api/event";

// listen("compress-progress", (event) => {
//   console.log("Progress:", event.payload);
// });
