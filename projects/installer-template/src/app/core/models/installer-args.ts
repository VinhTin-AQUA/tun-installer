export enum InstallerStatus {
    Idle = 'Idle',
    Install = 'Install',
    Uninstall = 'Uninstall',
}

export interface InstallerArgs {
    status: InstallerStatus;
}
