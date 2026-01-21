import { InstallerProperties, RegistryKeys } from 'installer-core';

export interface InstallerConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
}

export interface SaveInstallerConfig {
    payload: InstallerConfig;
    filePath: string;
}
