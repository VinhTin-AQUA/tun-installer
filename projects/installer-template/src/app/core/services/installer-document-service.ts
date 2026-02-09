import { inject, Injectable } from '@angular/core';
import { TauriCommandService } from '../tauri/tauri-command-service';
import { InstallerDocument } from '../models/installer-document';
import { InstallerDocumentCommands } from '../enums/tauri-commands';
import { InstallerPropertyStore, RegistryKeyStore, WindowInfoStore } from 'data-access';

@Injectable({
    providedIn: 'root',
})
export class InstallerDocumentService {
    installerPropertyStore = inject(InstallerPropertyStore)
    registryKeyStore = inject(RegistryKeyStore)
    windowInfoStore = inject(WindowInfoStore)

    constructor(private TauriCommandService: TauriCommandService) {}

    async getInstallerDocument() {
        const r = await this.TauriCommandService.invokeCommand<InstallerDocument, undefined>(
            InstallerDocumentCommands.GET_INSTALLER_DOCUMENT_COMMAND,
            undefined,
        );

        if(r) {
            this.installerPropertyStore.update(r.properties);
            this.registryKeyStore.setRegistry({
                configRegistry: r.registryKeys.configRegistry,
                uninstallRegistry: r.registryKeys.uninstallRegistry
            });
            this.windowInfoStore.setWindows(r.windowInfos);
        }
    }
}
