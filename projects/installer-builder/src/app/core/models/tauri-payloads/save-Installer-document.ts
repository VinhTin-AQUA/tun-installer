import { InstallerProperties, Prerequisite, RegistryKeys, WindowInfo } from 'data-access';

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
