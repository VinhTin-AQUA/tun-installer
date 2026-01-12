import {InstallerProperties} from 'installer-core'

export interface WorkingConfigFileState {
    content: string;
    filePath: string | null;
    isDirty: boolean;
}

