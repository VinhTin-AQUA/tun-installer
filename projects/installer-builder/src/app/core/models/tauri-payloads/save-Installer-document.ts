import { InstallerProperties,InstallerPropertyStore } from 'installer-core';

export interface SaveInstallerDocument {
    payload: InstallerProperties;
    filePath: string;
}
