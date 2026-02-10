import { Injectable } from '@angular/core';
import { InstallCommands, TauriCommandService, UninstallCommands } from 'service';

@Injectable({
    providedIn: 'root',
})
export class UninstallerService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async uninstall() {
        const r = await this.tauriCommandService.invokeCommand<boolean, undefined>(
            UninstallCommands.UNINSTALL_COMMAND,
            undefined,
        );
        return r;
    }

    // async uninstall() {}

    async cancelInstall() {}
    async cancelUninstall() {}
}
