# Tun Installer Documentation

## Example

- See that project to setup your project [example project](examples/first-app)

## Project Structure

```txt
project-name/
│
├── configs/
├── pages/
├── prerequisites/
└── resources/
```

## Init project

- Create new project -> select project folder and enter project name

### configs folder

- You do not setup anything in this folder. But you can open **configs/config.json** to see metadata

### pages folder

- This folder include **first-time-install** and **maintenance** folder.
- **first-time-install** includes installer UI (.html files)
- **maintenance** includes uninstaller UI (.html files)
- Example

    ```txt
    pages/
    │
    ├── first-time-install/
    │   ├── 1_welcome.html
    │   └── 5_finish-dialog.html
    └── maintenance/
        ├── verify_uninstall.html
        └── finish.html
    ```

> No .css file

> Name .html file for anything you want

- Here's a little tip - you can use CSS to style the interface for better balance

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

### prerequisites folder

- This folder includes required prerequisites such as exe files. In thoery, It can contain any exe file you want
- Example

    ```txt
    prerequisites/
    │
    ├── dotnet-sdk-8.0.416-win-x64.exe
    └── wps-office_11.1.0.11723.exe
    ```

### resources folder

- You can copy app resource files to resources folder
- Example

    ```txt
    resources/
    │
    ├── app.exe
    └── lib.dll
    ```

## Binding

### Supporting properties

- Properties

    | Property       | Description                                                                                    |
    | -------------- | ---------------------------------------------------------------------------------------------- |
    | appDir         | Directory containing the main application after build or installation.                         |
    | productName    | The display name of the application.                                                           |
    | icon           | Path to the application icon file.                                                             |
    | productVersion | Current version of the application.                                                            |
    | publisher      | Name of the application publisher.                                                             |
    | supportLink    | URL to the support website or help page.                                                       |
    | supportEmail   | Support contact email address.                                                                 |
    | comment        | Additional notes or description for the build/configuration.                                   |
    | buildDir       | Directory where build output files are generated.                                              |
    | fileToRun      | Main executable file of the application.                                                       |
    | runAsAdmin     | Indicates whether the application requires Administrator privileges (true/false).              |
    | lauchApp       | Indicates whether the application should automatically launch after installation (true/false). |

- Object to send to client

```json
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
```

- Use via **window.App.data** in window.initApp or **data** in window.render

    ```html
    <script>
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
    </script>
    ```

- **window.initApp** init data and init UI
- **window.render** is used to receive continuous data such as progress, logs,... and update UI

> You only can update value in html using JS script

### Supporting methods

- Use via **window.App.data**

#### navigateTo

- Navigates to a specific page with the given page name and page type

    ```js
    navigateTo(pageName: string, type: PageType): void
    ```

    - **pageName**: html file name
    - **type**: **'firstInstall'** or **'maintenance'**

- Usage

    ```html
    <button onclick="navigateToFolderDialog()">Next</button>

    <script>
        function navigateToFolderDialog() {
            window.App.navigateTo('2_folder-dialog.html', 'firstInstall');
        }
    </script>
    ```

#### install

- Starts the installation process and optionally redirects to a specified page after installation

    ```js
    install(afterInstallPage: string | null)
    ```

    - **afterInstallPage**: The navigation page appears after the installation process is complete

- Usage

    ```html
    <button onclick="install()">Install</button>

    <script>
        function install() {
            window.App.navigateTo('4_progress-dialog.html', 'firstInstall');
            window.App.install('5_finish-dialog.html');
        }
    </script>
    ```

#### finishInstall

- Completes the installation process and optionally launches the application immediately

    ```js
    finishInstall(launchAppNow: boolean): Promise<void>
    ```

- Usage

    ````html
    <button onclick="finishInstall()">Finish</button>

    <script>
        function finishInstall() {
            const checkbox = document.getElementById('lauch-app-now');
            window.App.finishInstall(checkbox.checked);
        }
    </script>
    ```
    ````

#### uninstall

- Starts the uninstallation process and optionally redirects to a specified page after uninstallation

    ```js
    uninstall(afterUninstallPage: string | null): Promise<void>
    ```

    - **afterUninstallPage**: The navigation page appears after the uninstallation process is complete

- Usage

    ```html
    <button onclick="uninstall()">✔ Uninstall</button>

    <script>
        function uninstall() {
            window.App.navigateTo('progress.html', 'maintenance');
            window.App.uninstall('finish.html');
        }
    </script>
    ```

#### finishUninstall

- Completes the uninstallation process

    ```js
    finishUninstall(): Promise<void>
    ```

- Usage

    ```html
    <button onclick="finishUninstall()">Close</button>

    <script>
        function finishUninstall() {
            window.App.finishUninstall();
        }
    </script>
    ```
