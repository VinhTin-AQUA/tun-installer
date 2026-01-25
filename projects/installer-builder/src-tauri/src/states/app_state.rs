use crate::{adapters::TauriProgressReporter, services::Compressor};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub compressor: Arc<Mutex<Compressor<TauriProgressReporter>>>,
}
