import { Injectable } from '@angular/core';
import { TauriCommandService } from './tauri-command-service';
import { Commands } from '../enums/commands';
import {
    InstallerDocumentConfig,
    SaveInstallerDocument,
} from '../models/tauri-payloads/save-Installer-document';
import { WorkingConfigFileState } from '../models/installer-config.model';

@Injectable({
    providedIn: 'root',
})
export class InstallerConfigService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async saveInstallerDocumentConfig(data: SaveInstallerDocument): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.SAVE_INSTALLER_CONFIG_COMMAND,
            data
        );
        return r ?? false;
    }

    async updateWorkingConfig(data: WorkingConfigFileState): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.UPDATE_WORKING_CONFIG_COMMAND,
            { data: data }
        );
        return r ?? false;
    }

    async loadWorkingConfig() {
        const r = await this.tauriCommandService.invokeCommand<WorkingConfigFileState>(
            Commands.LOAD_WORKING_CONFIG_COMMAND,
            {}
        );
        return r;
    }

    async loadInstallerDocumentConfig(filePath: string) {
        const r = await this.tauriCommandService.invokeCommand<InstallerDocumentConfig>(
            Commands.LOAD_INSTALLER_DOCUMENT_CONFIG_COMMAND,
            { filePath: filePath }
        );
        return r;
    }
}
