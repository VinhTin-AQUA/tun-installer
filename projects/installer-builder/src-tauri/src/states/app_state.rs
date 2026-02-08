use service::Compressor;

use crate::adapters::TauriProgressReporter;
use std::sync::Arc;

pub struct AppState {
    pub compressor: Arc<Compressor<TauriProgressReporter>>,
}
