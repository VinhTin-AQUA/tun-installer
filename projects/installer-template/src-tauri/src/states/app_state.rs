use serde::{Deserialize, Serialize};
use service::Compressor;

use crate::{adapters::TauriProgressReporter, enums::InstallerStatus};

use clap::Parser;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub compressor: Arc<Compressor<TauriProgressReporter>>,
}

#[derive(Serialize, Deserialize,Parser, Debug, Clone)]
pub struct InstallerArgs {
    #[arg(long, value_enum, default_value_t = InstallerStatus::Install)]
    pub status: InstallerStatus,
}
