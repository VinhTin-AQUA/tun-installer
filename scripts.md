### Angular commands

- create angular monorepo

    ```bash
    ng new my-workspace --create-application=false
    cd my-workspace

    ng generate application app1
    ng generate application app2
    ng generate library shared-lib

    ng g library data-access --project-root=libs/angular/data-access;

    ng s installer-template
    ```

- create component in lib

    ```bash
    ng generate component components/button --project=shared-lib
    ng g s tauri-command-service --project=tauri
    ```

- build lib

    ```bash
    ng build shared-lib
    ```

### Cargo commands

- run với installer_builder là name trong khối [package] trong Cargo.toml của src-tauri cụ thể

    ```bash
    cargo run -p installer_builder
    npm run dev:installer:builder
    ```

- Run with npx

    ```bash
    cd projects/installer-builder/src-tauri && npx tauri dev
    ```

- Build tauri with npx

    ```bash
    cd projects/installer-builder/src-tauri && npx tauri build --no-bundle --target x86_64-pc-windows-msvc
    ```

- create crate lib

    ```bash
    cargo new shared-lib --lib
    ```

- run project

    ```bash
    cargo run -p cleaner
    ```

### Add prop binding in template

## Project Structure

```txt
project-names
    - sources
    - pages
    - prerequisites
    - configs
```

### properties

- appDir
- productName
- icon
- productVersion
- publisher
- supportLink
- supportEmail
- comment
- buildDir
- fileToRun
- runAsAdmin
- lauchApp

- su dung thuoc tinh

    ```js
    // get init value
    window.initApp = function () {
        console.log('Init:', window.App.data);

        document.getElementById('process').innerText = window.App.data.progress + '%';
    };

    // get update value
    window.render = function (data) {
        console.log(data);

        document.getElementById('process').innerText = data.progress + '%';
    };
    ```

- tư tưởng lấy dữ liệu: khi onload thì gọi 1 hàm sự kiện đến html thuần để nhận data
- tương tự cập nhật dữ liệu mới thì gọi 1 hàm sự kiện gửi đến html thuần mỗi khi có thay đổi về dữ liệu
- có thể sử dụng cơ chế post postMessage để gửi dữ liệu mới đến HTML page

### methods

- navigateTo
- save

- Su dung ham

    ```html
    <button onclick="navigateToFolderDialog()">Next →</button>
    ```

    ```js
    <script>
        function navigateToFolderDialog() {
            window.App.navigateTo('2_folder-dialog.html', 'firstInstall');
        }
    </script>
    ```

### Pages folder

- page1.html
- page2.html

### Lưu ý khi tạo html page

- html, body nên để stlye như sau

    ```css
    html,
    body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    ```

- toàn bộ nội dung bên trong không nên vượt quá kích thước của screen

- thứ tự các màng hình sắp xếp theo thứ tự alphabet
- bổ sung nút chọn folder và hiển thị vào input, bổ sung dung lượng khả dụng, dung lượng yêu cầu, dung lương còn lại sau khi cài đặt, bổ sung thêm progress bar

// /media/newtun/Data/Dev/custom installer/tun-installer/examples/first-app
// C:/Users/tinhv/Desktop/f/tun-installer/examples/first-app

## Chạy exe với tham số

```bash
exe_template_v1.0.0.exe --status uninstall
```

### rcedit-x64.exe

- Chỉnh sửa resource của file exe
- link: https://github.com/electron/rcedit

### Để test mà không cần build exe template
- trong projects\installer-template\src-tauri\src\bootstrapper\bootstrapper.rs
đổi temp_app_dir thành đường dẫn dự án

- trong libs\rust\helpers\src\file_helper.rs
đổi exe_path_buf thành file exe đã được nén

### Data send to client
{
    "installationLocation": "C:\\Program Files\\Newtun\\First App",
    "productName": "First App",
    "icon": "icon.ico",
    "productVersion": "1.0.0",
    "publisher": "Newtun",
    "supportLink": "https://support.mycompany.com",
    "supportEmail": "support@mycompany.com",
    "comment": "Default installer comment",
    "launchFile": "FirstApp.exe",
    "runAsAdmin": false,
    "launchApp": true,
    "progress": 97.08,
    "message": "Delete app folder after exit..."
}