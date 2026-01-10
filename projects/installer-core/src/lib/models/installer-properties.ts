export interface InstallerProperties {
    appDir: string; // install location
    productName: string; // app name
    icon: string; // icon
    productVersion: string; // version
    publisher: string; // publisher
    supportLink: string; // support link
    supportEmail: string; // support email
    comment: string; // comment
    sourceDir: string; // source to compress
    launchFile: string; // exe file
    runAsAdmin: boolean; // run as administrator
    launchApp: boolean; // run app after install
};
