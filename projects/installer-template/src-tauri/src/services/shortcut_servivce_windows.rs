use std::path::PathBuf;

use windows::{
    core::*,
    Win32::{Foundation::*, System::Com::*, UI::Shell::*},
};

pub fn create_shortcuts(
    app_name: &str,
    target: &str,
    args: Option<&str>,
    icon: Option<&str>,
    run_as_admin: bool, // thêm tham số
) -> windows::core::Result<()> {
    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()?;

        // Desktop public
        let public_desktop = known_folder(&FOLDERID_PublicDesktop)?;
        create_one_shortcut(
            &public_desktop.join(format!("{app_name}.lnk")),
            target,
            args,
            icon,
            run_as_admin,
        )?;

        // Start menu common
        let common_programs = known_folder(&FOLDERID_CommonPrograms)?;
        create_one_shortcut(
            &common_programs.join(format!("{app_name}.lnk")),
            target,
            args,
            icon,
            run_as_admin,
        )?;

        CoUninitialize();
    }

    Ok(())
}

fn create_one_shortcut(
    shortcut_path: &PathBuf,
    target: &str,
    args: Option<&str>,
    icon: Option<&str>,
    run_as_admin: bool,
) -> windows::core::Result<()> {
    unsafe {
        // TẠO MỚI ShellLink cho từng shortcut (rất quan trọng)
        let shell_link: IShellLinkW = CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER)?;

        shell_link.SetPath(&HSTRING::from(target))?;

        if let Some(a) = args {
            shell_link.SetArguments(&HSTRING::from(a))?;
        }

        if let Some(icon_path) = icon {
            shell_link.SetIconLocation(&HSTRING::from(icon_path), 0)?;
        }

        // ===== RUN AS ADMIN =====
        if run_as_admin {
            let data_list: IShellLinkDataList = shell_link.cast()?;
            let mut flags = data_list.GetFlags()?;
            flags |= SLDF_RUNAS_USER.0 as u32;
            data_list.SetFlags(flags)?;
        }
        // =========================

        let persist: IPersistFile = shell_link.cast()?;

        persist.Save(
            &HSTRING::from(shortcut_path.to_string_lossy().to_string()),
            true,
        )?;
    }

    Ok(())
}

fn known_folder(id: &GUID) -> windows::core::Result<PathBuf> {
    unsafe {
        let path = SHGetKnownFolderPath(id, KNOWN_FOLDER_FLAG(0), HANDLE(0))?;
        Ok(PathBuf::from(path.to_string()?))
    }
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
                            && path
                                .file_stem()
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
