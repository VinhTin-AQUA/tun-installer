type InstallerProperties = {
    appDir: string; // đường dẫn cài đặt
    productName: string; // tên ứng dụng
    icon: string; // icon
    productVersion: string; // version
    publisher: string; // publisher
    supportLink: string; // support link
    supportEmail: string; // support email
    comment: string; // comment
    buildDir: string; // chọn thư mục chứa source
    fileToRun: string; // chọn file để chạy
    runAsAdmin: boolean; // run app với admin
    lauchApp: boolean; // run app ngay lập tức
};
