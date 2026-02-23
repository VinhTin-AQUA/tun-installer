import { InstallerProperties, MemorySpace, Prerequisite, RegistryKeys, WindowInfos } from 'data-access';

export interface InstallerConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfos: WindowInfos;
    prerequisites: Prerequisite[];
    memorySpace: MemorySpace
}

export interface SaveInstallerConfig {
    payload: InstallerConfig;
    filePath: string;
}
