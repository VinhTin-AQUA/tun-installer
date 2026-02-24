import { inject, Injectable } from '@angular/core';
import { InstallerDocumentConfig, InstallerPropertyStore, MemorySpaceStore, RegistryKeyStore, WindowInfoStore } from 'data-access';
import { InstallerDocumentCommands, TauriCommandService } from 'service';

@Injectable({
    providedIn: 'root',
})
export class InstallerDocumentService {
    installerPropertyStore = inject(InstallerPropertyStore);
    registryKeyStore = inject(RegistryKeyStore);
    windowInfoStore = inject(WindowInfoStore);
    memorySpaceStore = inject(MemorySpaceStore);

    constructor(private TauriCommandService: TauriCommandService) {}

    async getInstallerDocument() {
        const r = await this.TauriCommandService.invokeCommand<InstallerDocumentConfig, undefined>(
            InstallerDocumentCommands.GET_INSTALLER_DOCUMENT_COMMAND,
            undefined,
        );

        if (r) {
            this.installerPropertyStore.update(r.properties);
            this.registryKeyStore.setRegistry({
                configRegistry: r.registryKeys.configRegistry,
                uninstallRegistry: r.registryKeys.uninstallRegistry,
            });
            this.windowInfoStore.setWindows(r.windowInfos);
            this.memorySpaceStore.setMemorySpace(r.memorySpace);
        }
    }
}
