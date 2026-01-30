import { Injectable } from '@angular/core';
import { TauriCommandService } from '../tauri/tauri-command-service';
import { InstallCommands } from '../enums/tauri-commands';

@Injectable({
    providedIn: 'root',
})
export class InstallerService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async install(folders: string[]) {
        const r = await this.tauriCommandService.invokeCommand<boolean, object>(
            InstallCommands.INSTALL,
            { folders: folders },
        );
        return r;
    }

    async uninstall() {}

    async cancelInstall() {}
    async cancelUninstall() {}
}
