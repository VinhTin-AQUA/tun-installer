use clap::ValueEnum;

#[derive(Debug, Clone, Copy, ValueEnum, PartialEq)]
pub enum InstallerStatus {
  Idle,
  Install,
  Uninstall,
}
