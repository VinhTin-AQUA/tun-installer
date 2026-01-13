import { InstallerProperties } from 'installer-core';

export interface InstallerDocumentConfig {
    properties: InstallerProperties;
}

export interface SaveInstallerDocument {
    payload: InstallerDocumentConfig;
    filePath: string;
}
