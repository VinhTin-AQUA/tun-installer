use crate::{adapters::TauriProgressReporter, services::Compressor};
use std::sync::Arc;

pub struct AppState {
    pub compressor: Arc<Compressor<TauriProgressReporter>>,
}
