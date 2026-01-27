use crate::adapters::TauriProgressReporter;
use shared_lib::Compressor;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub compressor: Arc<Compressor<TauriProgressReporter>>,
}
