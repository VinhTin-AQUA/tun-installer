import { InstallerProperties, RegistryKeys, WindowInfo } from 'installer-core';

export interface InstallerConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfo: WindowInfo
}

export interface SaveInstallerConfig {
    payload: InstallerConfig;
    filePath: string;
}
