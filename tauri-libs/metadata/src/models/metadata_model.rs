use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UINode {
    #[serde(rename = "type")]
    pub node_type: String,

    #[serde(default)]
    pub class: Option<Vec<String>>,

    #[serde(default)]
    pub attrs: Option<HashMap<String, String>>,

    #[serde(default)]
    pub styles: Option<HashMap<String, String>>,

    #[serde(default)]
    pub text: Option<String>,

    #[serde(default)]
    pub children: Option<Vec<UINode>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UIStyles {
    pub global: HashMap<String, HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UIPage {
    pub styles: UIStyles,
    pub root: UINode,
}
