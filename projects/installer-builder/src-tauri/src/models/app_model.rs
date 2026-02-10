use clap::Parser;

#[derive(Parser, Debug)]
pub struct Args {
    #[arg(long)]
    env: String,

    #[arg(long)]
    channel: String,

    #[arg(long, default_value_t = false)]
    debug_mode: bool,
}
