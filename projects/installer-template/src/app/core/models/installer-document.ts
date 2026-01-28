import { InstallerProperties, RegistryKeys, WindowInfo } from 'installer-core';

export interface InstallerDocument {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfo: WindowInfo;
}
