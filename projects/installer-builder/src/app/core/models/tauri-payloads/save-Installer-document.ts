import { InstallerProperties } from 'installer-core';

export interface SaveConfig {
    properties: InstallerProperties;
}

export interface SaveInstallerDocument {
    payload: SaveConfig;
    filePath: string;
}
