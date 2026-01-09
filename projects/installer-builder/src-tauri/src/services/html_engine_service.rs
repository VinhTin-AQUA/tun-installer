use tokio::fs;

use crate::models::HtmlPage;

// pub struct HtmlEngine {}

pub async fn load_html_pages() -> anyhow::Result<Option<Vec<HtmlPage>>> {
    let folder_path = "/media/newtun/Data/Dev/custom installer/pages";
    let mut result: Vec<HtmlPage> = Vec::new();

    let mut dir = fs::read_dir(folder_path).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();

        // Chỉ đọc file
        if path.is_file() {
            let file_name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
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
