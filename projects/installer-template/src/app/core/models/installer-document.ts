import { InstallerProperties, RegistryKeys, WindowInfos } from 'data-access';

export interface InstallerDocument {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfos: WindowInfos;
}
