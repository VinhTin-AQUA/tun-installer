use std::env;

fn main() {
    let temp = env::temp_dir();

    println!("temp = {:?}", temp.to_string_lossy().to_string());
}
