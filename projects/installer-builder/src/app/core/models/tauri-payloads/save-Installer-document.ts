import { InstallerProperties, Prerequisite, RegistryKeys, WindowInfos } from 'data-access';

export interface InstallerConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfos: WindowInfos;
    prerequisites: Prerequisite[];
}

export interface SaveInstallerConfig {
    payload: InstallerConfig;
    filePath: string;
}
