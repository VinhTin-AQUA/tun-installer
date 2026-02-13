use std::io;
use std::io::Read;
use std::path::Path;
use std::{env, path::PathBuf, process::Command};
use tokio::fs;

#[tokio::main]
async fn main() -> io::Result<()> {
    let path = PathBuf::from("C:\\Program Files\\Newtun\\First App").join("FirstApp.exe");
    let t = run_exe_installer_file(path, "", false).await;
    Ok(())
}

#[cfg(target_os = "windows")]
pub async fn run_exe_installer_file(
    path: PathBuf,
    arg_input: &str,
    run_as_admin: bool,
) -> Result<bool, String> {
    let arg_input = arg_input.to_string();

    tokio::task::spawn_blocking(move || {
        let args = parse_args(&arg_input);

        if run_as_admin {
            use std::process::Command;

            let arg_list = args.join(" ");

            Command::new("powershell")
                .args([
                    "-Command",
                    &format!(
                        "Start-Process -FilePath '{}' -ArgumentList '{}' -Verb runAs -Wait",
                        path.display(),
                        arg_list
                    ),
                ])
                .spawn()
                .map_err(|e| e.to_string())?
                .wait()
                .map_err(|e| e.to_string())?;
        } else {
            use std::process::Command;

            Command::new(&path)
                .args(&args)
                .spawn()
                .map_err(|e| e.to_string())?
                .wait()
                .map_err(|e| e.to_string())?;
        }

        Ok(true)
    })
    .await
    .map_err(|e| e.to_string())?
}

// parse input args
fn parse_args(input: &str) -> Vec<String> {
    shlex::split(input).unwrap_or_default()
}
