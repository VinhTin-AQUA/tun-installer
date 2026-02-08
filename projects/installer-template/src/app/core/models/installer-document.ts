import { InstallerProperties, RegistryKeys, WindowInfo } from 'data-access';

export interface InstallerDocument {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfo: WindowInfo;
}
