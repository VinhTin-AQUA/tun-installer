import { InstallerProperties } from './installer-properties';
import { MemorySpace } from './memory-space';
import { Prerequisite } from './prerequisite';
import { RegistryKeys } from './registry.model';
import { WindowInfos } from './window-info';

export interface InstallerDocumentConfig {
    properties: InstallerProperties;
    registryKeys: RegistryKeys;
    windowInfos: WindowInfos;
    prerequisites: Prerequisite[];
    memorySpace: MemorySpace;
}
