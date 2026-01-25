use crate::services::{Progress, CompressProgressReporter};
use tauri::{AppHandle, Emitter};

pub struct TauriProgressReporter {
    app: AppHandle,
}

impl TauriProgressReporter {
    pub fn new(app: AppHandle) -> Self {
        Self { app }
    }
}

impl CompressProgressReporter for TauriProgressReporter {
    fn report(&self, percent: Progress) {
        let _ = self.app.emit("compress-progress", percent);
    }
}
