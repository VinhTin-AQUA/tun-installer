import { InstallerProperties, RegistryKeys } from 'installer-core';

export interface InstallerDocumentConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
}

export interface SaveInstallerDocument {
    payload: InstallerDocumentConfig;
    filePath: string;
}
