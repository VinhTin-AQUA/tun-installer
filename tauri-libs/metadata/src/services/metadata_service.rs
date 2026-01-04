use std::{env, fs::OpenOptions, io::{Read, Write}};
use tokio::fs;
use crate::UIPage;

pub async fn read_data_from_exe() -> Result<UIPage, String> {
    // current exe
    // let exe_path = env::current_exe().unwrap();
    // let data = fs::read(&exe_path).await.unwrap_or(Vec::new());

    // println!("path: {:?}",exe_path.to_str());

    // special exe file
    // let data = fs::read(&"/media/newtun/Data/Dev/custom installer/test.exe")
    //     .await
    //     .unwrap_or(Vec::new());

    // let marker_start = b"--MY_DATA_START--";
    // let marker_end = b"--MY_DATA_END--";

    // if let Some(start) = data
    //     .windows(marker_start.len())
    //     .rposition(|w| w == marker_start)
    // {
    //     let start_pos = start + marker_start.len();
    //     if let Some(end) = data[start_pos..]
    //         .windows(marker_end.len())
    //         .position(|w| w == marker_end)
    //     {
    //         let extracted = &data[start_pos..start_pos + end];
    //         // trim newline do bạn tự thêm
    //         let json_string = String::from_utf8_lossy(extracted).trim().to_string();

    //         println!("Dữ liệu đọc được:");
    //         println!("{}", json_string);

    //         let page: UIPage = serde_json::from_str(&json_string).map_err(|e| e.to_string())?;
    //         return Ok(page);
    //     }
    // }
    // return Err("No UI Page".to_string());

    let input = r#"
    {
        "styles": {
            "global": {
            "*": {
                "boxSizing": "border-box"
            },
            "body": {
                "marginTop": "0px",
                "marginRight": "0px",
                "marginBottom": "0px",
                "marginLeft": "0px",
                "paddingTop": "0px",
                "paddingRight": "0px",
                "paddingBottom": "0px",
                "paddingLeft": "0px",
                "fontFamily": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Helvetica Neue\", Arial, sans-serif",
                "backgroundImage": "linear-gradient(135deg, rgb(79, 70, 229), rgb(99, 102, 241))",
                "backgroundPositionX": "initial",
                "backgroundPositionY": "initial",
                "backgroundSize": "initial",
                "backgroundRepeat": "initial",
                "backgroundAttachment": "initial",
                "backgroundOrigin": "initial",
                "backgroundClip": "initial",
                "backgroundColor": "initial"
            },
            ".welcome-wrapper": {
                "minHeight": "100vh",
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center"
            },
            ".welcome-card": {
                "backgroundImage": "initial",
                "backgroundPositionX": "initial",
                "backgroundPositionY": "initial",
                "backgroundSize": "initial",
                "backgroundRepeat": "initial",
                "backgroundAttachment": "initial",
                "backgroundOrigin": "initial",
                "backgroundClip": "initial",
                "backgroundColor": "rgb(255, 255, 255)",
                "paddingTop": "40px",
                "paddingRight": "32px",
                "paddingBottom": "40px",
                "paddingLeft": "32px",
                "borderTopLeftRadius": "16px",
                "borderTopRightRadius": "16px",
                "borderBottomRightRadius": "16px",
                "borderBottomLeftRadius": "16px",
                "maxWidth": "420px",
                "width": "100%",
                "boxShadow": "rgba(0, 0, 0, 0.15) 0px 20px 40px",
                "textAlign": "center"
            },
            ".welcome-title": {
                "fontSize": "32px",
                "marginTop": "0px",
                "marginRight": "0px",
                "marginBottom": "12px",
                "marginLeft": "0px",
                "color": "rgb(17, 24, 39)"
            },
            ".welcome-subtitle": {
                "fontSize": "16px",
                "color": "rgb(107, 114, 128)",
                "marginTop": "0px",
                "marginRight": "0px",
                "marginBottom": "0px",
                "marginLeft": "0px"
            },
            ".welcome-divider": {
                "height": "1px",
                "backgroundImage": "initial",
                "backgroundPositionX": "initial",
                "backgroundPositionY": "initial",
                "backgroundSize": "initial",
                "backgroundRepeat": "initial",
                "backgroundAttachment": "initial",
                "backgroundOrigin": "initial",
                "backgroundClip": "initial",
                "backgroundColor": "rgb(229, 231, 235)",
                "marginTop": "24px",
                "marginRight": "0px",
                "marginBottom": "24px",
                "marginLeft": "0px"
            },
            ".welcome-text": {
                "fontSize": "15px",
                "color": "rgb(55, 65, 81)",
                "lineHeight": "1.6",
                "marginBottom": "28px"
            },
            ".welcome-actions": {
                "display": "flex",
                "rowGap": "12px",
                "columnGap": "12px",
                "justifyContent": "center",
                "flexWrap": "wrap"
            },
            ".btn": {
                "display": "inline-block",
                "paddingTop": "10px",
                "paddingRight": "18px",
                "paddingBottom": "10px",
                "paddingLeft": "18px",
                "borderTopLeftRadius": "8px",
                "borderTopRightRadius": "8px",
                "borderBottomRightRadius": "8px",
                "borderBottomLeftRadius": "8px",
                "fontSize": "14px",
                "textDecorationLine": "none",
                "textDecorationThickness": "initial",
                "textDecorationStyle": "initial",
                "textDecorationColor": "initial",
                "transitionBehavior": "normal",
                "transitionDuration": "0.2s",
                "transitionTimingFunction": "ease",
                "transitionDelay": "0s",
                "transitionProperty": "all"
            },
            ".btn-primary": {
                "backgroundImage": "initial",
                "backgroundPositionX": "initial",
                "backgroundPositionY": "initial",
                "backgroundSize": "initial",
                "backgroundRepeat": "initial",
                "backgroundAttachment": "initial",
                "backgroundOrigin": "initial",
                "backgroundClip": "initial",
                "backgroundColor": "rgb(79, 70, 229)",
                "color": "rgb(255, 255, 255)"
            },
            ".btn-primary:hover": {
                "backgroundImage": "initial",
                "backgroundPositionX": "initial",
                "backgroundPositionY": "initial",
                "backgroundSize": "initial",
                "backgroundRepeat": "initial",
                "backgroundAttachment": "initial",
                "backgroundOrigin": "initial",
                "backgroundClip": "initial",
                "backgroundColor": "rgb(67, 56, 202)"
            }
            }
        },
        "root": {
            "type": "div",
            "children": [
            {
                "type": "div",
                "class": ["welcome-wrapper"],
                "attrs": {
                "class": "welcome-wrapper"
                },
                "children": [
                {
                    "type": "div",
                    "class": ["welcome-card"],
                    "attrs": {
                    "class": "welcome-card"
                    },
                    "children": [
                    {
                        "type": "h1",
                        "class": ["welcome-title"],
                        "attrs": {
                        "class": "welcome-title"
                        },
                        "children": [
                        {
                            "type": "text",
                            "text": "Welcome 👋"
                        }
                        ]
                    },
                    {
                        "type": "p",
                        "class": ["welcome-subtitle"],
                        "attrs": {
                        "class": "welcome-subtitle"
                        },
                        "children": [
                        {
                            "type": "text",
                            "text": "Chào mừng bạn đến với trình xây dựng giao diện kéo thả"
                        }
                        ]
                    },
                    {
                        "type": "div",
                        "class": ["welcome-divider"],
                        "attrs": {
                        "class": "welcome-divider"
                        }
                    },
                    {
                        "type": "p",
                        "class": ["welcome-text"],
                        "attrs": {
                        "class": "welcome-text"
                        },
                        "children": [
                        {
                            "type": "text",
                            "text": "Bắt đầu tạo giao diện của bạn bằng cách kéo thả các thành phần,\n        hoặc chỉnh sửa trực tiếp HTML & CSS theo ý muốn."
                        }
                        ]
                    },
                    {
                        "type": "div",
                        "class": ["welcome-actions"],
                        "attrs": {
                        "class": "welcome-actions"
                        },
                        "children": [
                        {
                            "type": "button",
                            "class": ["btn", "btn-primary"],
                            "attrs": {
                            "click": "print",
                            "class": "btn btn-primary"
                            },
                            "children": [
                            {
                                "type": "text",
                                "text": "Bắt đầu ngay"
                            }
                            ]
                        }
                        ]
                    }
                    ]
                }
                ]
            }
            ]
        }
        }
    "#;

    let page: UIPage = serde_json::from_str(input).unwrap();

    // Err("loi nghiem trong".to_string())

    Ok(page)
}

pub fn write_data_to_exe(data: String) -> Result<bool, String> {
    let mut file = OpenOptions::new()
        .append(true)
        .open("/media/newtun/Data/Dev/custom installer/exe_test.exe")
        .expect("Không mở được file");

    let marker_start = "--MY_DATA_START--";
    let marker_end = "--MY_DATA_END--";

    let data_with_marker = format!("\n{}\n{}\n{}", marker_start, data, marker_end);
    let data_bytes: &[u8] = data_with_marker.as_bytes();

    file.write_all(data_bytes).expect("Ghi thất bại");
    println!("Đã ghi dữ liệu vào cuối file");

    Ok(true)
}

pub fn remove_data() {
    let exe_path = env::current_exe().unwrap();

    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        // .open(&exe_path)
        .open("wps_office_inst.exe")
        .unwrap();

    let mut data = Vec::new();
    file.read_to_end(&mut data).unwrap();

    let marker = b"--MY_DATA_START--";

    if let Some(pos) = data
        .windows(marker.len())
        .position(|w| w == marker)
    {
        // Cắt file tại vị trí marker
        file.set_len(pos as u64).unwrap();
        println!("Đã xóa dữ liệu append");
    } else {
        println!("Không có dữ liệu để xóa");
    }
}


