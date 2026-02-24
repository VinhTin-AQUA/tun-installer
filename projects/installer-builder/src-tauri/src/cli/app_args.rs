use clap::Parser;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Parser, Debug, Clone)]
pub struct AppArgs {
    #[arg(long, default_value_t = false)]
    pub cli: bool,

    #[arg(long, default_value_t = String::from(""))]
    pub project: String,
}
