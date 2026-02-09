import { Injectable } from '@angular/core';
import { InstallCommands, TauriCommandService } from 'service';

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
