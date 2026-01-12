import { Injectable } from '@angular/core';
import { TauriCommandService } from './tauri-command-service';
import { Commands } from '../enums/commands';
import { SaveInstallerDocument } from '../models/tauri-payloads/save-Installer-document';

@Injectable({
    providedIn: 'root',
})
export class InstallerConfigService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async saveDocument(data: SaveInstallerDocument): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.SAVE_INSTALLER_CONFIG_COMMAND,
            data
        );
        return r ?? false;
    }

    async loadDocument() {}
}
