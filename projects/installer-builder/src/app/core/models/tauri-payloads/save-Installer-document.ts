import { InstallerProperties, Prerequisite, RegistryKeys, WindowInfo } from 'installer-core';

export interface InstallerConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfo: WindowInfo;
    prerequisites: Prerequisite[];
}

export interface SaveInstallerConfig {
    payload: InstallerConfig;
    filePath: string;
}
