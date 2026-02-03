use std::{env, path::PathBuf};

fn main() {
    let temp = env::temp_dir();

    println!("temp = {:?}", temp.to_string_lossy().to_string());


    let t = PathBuf::from("value").join("").join("fsef");
    println!("t = {:?}", t.to_string_lossy().to_string());
}
