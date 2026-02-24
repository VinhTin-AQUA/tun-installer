export interface InstallerData {
    installationLocation: string;
    productName: string;
    icon: string;
    productVersion: string;
    publisher: string;
    supportLink: string;
    supportEmail: string;
    comment: string;
    launchFile: string;
    runAsAdmin: boolean;
    launchApp: boolean;
    progress: number;
    message: string;
    volumeSpaceRequired: number;
    volumeSpaceAvailable: number;
    volumeSpaceRemaining: number;
}
