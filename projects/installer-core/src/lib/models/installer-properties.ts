export interface InstallerProperties {
    installationLocation: string; // install location
    productName: string; // app name
    icon: string; // icon
    productVersion: string; // version
    publisher: string; // publisher
    supportLink: string; // support link
    supportEmail: string; // support email
    comment: string; // comment
    launchFile: string; // exe file
    runAsAdmin: boolean; // run as administrator
    launchApp: boolean; // run app after install
    shortcutInDesktop: ShortcutInDesktop,
    shortcutInApplicationShortcut: ShortcutInApplicationShortcut
}

export interface ShortcutInDesktop {
    isCreated: boolean;
    runAsAdmin: boolean;
    shortcutName: string;
    runFile: string;
}

export interface ShortcutInApplicationShortcut {
    isCreated: boolean;
    runAsAdmin: boolean;
    shortcutName: string;
    runFile: string;
}
