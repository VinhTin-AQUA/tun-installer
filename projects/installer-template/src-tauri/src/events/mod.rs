use shared_lib::Progress;
use tauri::{AppHandle, Emitter};

pub fn send_progress_event(app: AppHandle, event: &str, progress: Progress) {
    let _ = app.emit(event, progress);
}