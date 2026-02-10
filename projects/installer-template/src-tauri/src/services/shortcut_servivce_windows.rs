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
    // C:\Users\tinhv\AppData\Roaming\Microsoft\Windows\Start Menu\Programs
    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()?;

        let shell_link: IShellLinkW = CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER)?;

        shell_link.SetPath(&HSTRING::from(target))?;

        if let Some(a) = args {
            shell_link.SetArguments(&HSTRING::from(a))?;
        }

        if let Some(icon_path) = icon {
            shell_link.SetIconLocation(&HSTRING::from(icon_path), 0)?;
        }

        let persist: IPersistFile = shell_link.cast()?;

        let desktop = known_folder(&FOLDERID_Desktop)?;
        save_link(&persist, &desktop, app_name)?;

        let programs = known_folder(&FOLDERID_Programs)?;
        save_link(&persist, &programs, app_name)?;
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

        // Desktop
        if let Ok(desktop) = known_folder(&FOLDERID_Desktop) {
            let mut path = desktop;
            path.push(format!("{app_name}.lnk"));
            let _ = std::fs::remove_file(path);
        }

        // Start Menu / Programs
        if let Ok(programs) = known_folder(&FOLDERID_Programs) {
            let mut path = programs;
            path.push(format!("{}.lnk", app_name));
            let _ = std::fs::remove_file(path);
        }
    }
    Ok(())
}
