use clap::ValueEnum;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, ValueEnum, PartialEq)]
pub enum InstallerStatus {
  Idle,
  Install,
  Uninstall,
}
