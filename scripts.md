### Angular commands

-   create angular monorepo

    ```bash
    ng new my-workspace --create-application=false
    cd my-workspace

    ng generate application app1
    ng generate application app2
    ng generate library shared-lib

    ng s installer-template
    ```

-   create component in lib

    ```bash
    ng generate component components/button --project=shared-lib
    ```

-   build lib

    ```bash
    ng build shared-lib
    ```

### Cargo commands

-   run với installer_builder là name trong khối [package] trong Cargo.toml của src-tauri cụ thể

    ```bash
    cargo run -p installer_builder
    npm run dev:installer:builder
    ```

-   Run with npx

    ```bash
    cd projects/installer-builder/src-tauri && npx tauri dev
    ```

-   Build tauri with npx

    ```bash
    cd projects/installer-builder/src-tauri && npx tauri build --no-bundle --target x86_64-pc-windows-msvc
    ```

-   create crate lib

    ```bash
    cargo new shared-lib --lib
    ```

### Add prop binding in template

-   add attr or event in projects/installer-template/src/app/shared/directives/attrs.ts
-   add condition in projects/installer-template/src/app/shared/directives/attrs.ts
-   add properties in component projects/installer-template/src/app/pages/ui-renderer/ui-renderer.ts

### properties

-   appDir
-   productName
-   icon
-   productVersion
-   publisher
-   supportLink
-   supportEmail
-   comment
-   buildDir
-   fileToRun
-   runAsAdmin
-   lauchApp

### methods

-   event-click

    -   example

        ```html
        <button event-click="print">Bắt đầu</button>
        ```

        ```ts
        print() {
            console.log("hello world");
        }
        ```

### Attributes

-   with specical value

    -   alt
    -   class
    -   href
    -   src

    -   example
        ```html
        <a href="https://google.com"></a>
        ```

-   binding from property

    -   href
    -   src
    -   example with **appDir** property

        ```html
        <a prop-href="appDir"></a>
        ```
