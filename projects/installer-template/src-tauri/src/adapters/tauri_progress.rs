use domain::event_consts;
use service::{CompressProgressReporter, Progress};
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
        let _ = self.app.emit(event_consts::INSTALL, percent);
    }
}
