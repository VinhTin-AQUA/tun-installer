use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct HtmlPage {
    pub content: String,
    pub name: String,
}
