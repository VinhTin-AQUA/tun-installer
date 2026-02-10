use std::path::PathBuf;

use windows::{
    core::*,
    Win32::{Foundation::*, System::Com::*, UI::Shell::*},
};

// create short cut
pub fn create_shortcuts(
    app_name: &str,
    target: &str,
    args: Option<&str>,
    icon: Option<&str>,
) -> windows::core::Result<()> {
    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()?;

        let shell_link: IShellLinkW =
            CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER)?;

        shell_link.SetPath(&HSTRING::from(target))?;

        if let Some(a) = args {
            shell_link.SetArguments(&HSTRING::from(a))?;
        }

        if let Some(icon_path) = icon {
            shell_link.SetIconLocation(&HSTRING::from(icon_path), 0)?;
        }

        let persist: IPersistFile = shell_link.cast()?;

        // Desktop cho toàn bộ user
        let public_desktop = known_folder(&FOLDERID_PublicDesktop)?;
        save_link(&persist, &public_desktop, app_name)?;

        // Start Menu cho toàn bộ user
        let common_programs = known_folder(&FOLDERID_CommonPrograms)?;
        save_link(&persist, &common_programs, app_name)?;

        CoUninitialize();
    }

    Ok(())
}


fn known_folder(id: &GUID) -> windows::core::Result<PathBuf> {
    unsafe {
        let path = SHGetKnownFolderPath(id, KNOWN_FOLDER_FLAG(0), HANDLE(0))?;

        Ok(PathBuf::from(path.to_string()?))
    }
}

fn save_link(persist: &IPersistFile, dir: &PathBuf, name: &str) -> windows::core::Result<()> {
    let link_path = dir.join(format!("{name}.lnk"));

    unsafe {
        persist.Save(
            &HSTRING::from(link_path.to_string_lossy().to_string()),
            true,
        )?;
    }

    Ok(())
}

pub fn remove_shortcuts(app_name: &str) -> Result<()> {
    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()?;

        let folders = [
            &FOLDERID_Desktop,
            &FOLDERID_PublicDesktop,
            &FOLDERID_Programs,
            &FOLDERID_CommonPrograms,
        ];

        for folder_id in folders {
            if let Ok(folder) = known_folder(folder_id) {
                if let Ok(entries) = std::fs::read_dir(&folder) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.extension().and_then(|e| e.to_str()) == Some("lnk")
                            && path.file_stem()
                                .and_then(|s| s.to_str())
                                .map(|s| s.starts_with(app_name))
                                .unwrap_or(false)
                        {
                            let _ = std::fs::remove_file(&path);
                        }
                    }
                }
            }
        }

        CoUninitialize();
    }
    Ok(())
}
