use service::Compressor;

use crate::adapters::TauriProgressReporter;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub compressor: Arc<Compressor<TauriProgressReporter>>,
}
