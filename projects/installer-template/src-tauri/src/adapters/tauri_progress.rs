use shared_lib::{CompressProgressReporter, Progress};
use tauri::{AppHandle, Emitter};

use crate::consts::event_consts;

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
        let _ = self.app.emit(event_consts::INSTALL, percent);
    }
}
