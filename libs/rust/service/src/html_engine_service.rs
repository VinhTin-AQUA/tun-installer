use anyhow::bail;
use domain::{HTML_FIRST_TIME_INSTALL_DIR, HTML_MAINTENANCE_DIR, HTML_PAGE_DIR, HtmlPage};
use std::path::PathBuf;
use tokio::fs;

// pub struct HtmlEngine {}

// pub async fn load_html_pages(project_dir: String) -> anyhow::Result<Option<Vec<HtmlPage>>> {
//     // let folder_path = "/media/newtun/Data/Dev/custom installer/pages";

//     let mut page_dir = PathBuf::from(project_dir);
//     page_dir.push(consts::HTML_PAGE);

//     // let page_dir = Path::new(&page_dir);

//     if !page_dir.exists() {
//         bail!("Thư mục {} không tồn tại", page_dir.display())
//     }

//     let mut result: Vec<HtmlPage> = Vec::new();
//     let mut dir = fs::read_dir(&page_dir).await?;

//     while let Some(entry) = dir.next_entry().await? {
//         let path = entry.path();

//         // Chỉ đọc file
//         if path.is_file() {
//             let file_name = path
//                 .file_name()
//                 .and_then(|s| s.to_str())
//                 .unwrap_or("")
//                 .to_string();

//             let content = fs::read_to_string(&path).await?;

//             result.push(HtmlPage {
//                 name: file_name,
//                 content: content,
//             });
//         }
//     }

//     result.sort_by(|a, b| a.name.cmp(&b.name));

//     Ok(Some(result))
// }

pub async fn load_html_first_time_install_pages(
    project_dir: String,
) -> anyhow::Result<Option<Vec<HtmlPage>>> {
    // let folder_path = "/media/newtun/Data/Dev/custom installer/pages";

    let mut page_dir = PathBuf::from(project_dir);
    page_dir.push(HTML_PAGE_DIR);
    page_dir.push(HTML_FIRST_TIME_INSTALL_DIR);

    // let page_dir = Path::new(&page_dir);

    if !page_dir.exists() {
        bail!("Thư mục {} không tồn tại", page_dir.display())
    }

    let mut result: Vec<HtmlPage> = Vec::new();
    let mut dir = fs::read_dir(&page_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();

        // Chỉ đọc file
        if path.is_file() {
            let file_name = path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();

            let content = fs::read_to_string(&path).await?;

            result.push(HtmlPage {
                name: file_name,
                content: content,
            });
        }
    }

    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Some(result))
}

pub async fn load_html_maintenance_pages(
    project_dir: String,
) -> anyhow::Result<Option<Vec<HtmlPage>>> {
    // let folder_path = "/media/newtun/Data/Dev/custom installer/pages";

    let mut page_dir = PathBuf::from(project_dir);
    page_dir.push(HTML_PAGE_DIR);
    page_dir.push(HTML_MAINTENANCE_DIR);

    // let page_dir = Path::new(&page_dir);

    if !page_dir.exists() {
        bail!("Thư mục {} không tồn tại", page_dir.display())
    }

    let mut result: Vec<HtmlPage> = Vec::new();
    let mut dir = fs::read_dir(&page_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();

        // Chỉ đọc file
        if path.is_file() {
            let file_name = path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();

            let content = fs::read_to_string(&path).await?;

            result.push(HtmlPage {
                name: file_name,
                content: content,
            });
        }
    }

    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Some(result))
}
