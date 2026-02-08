export interface WindowInfo {
    title: string;
    width: number;
    height: number;
    startPage: string;
    alwaysOnTop: boolean
}

export interface WindowInfos {
    installerWindow: WindowInfo;
    uninstallerWindow: WindowInfo;
}

