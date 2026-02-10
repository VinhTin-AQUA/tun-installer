import { Injectable } from '@angular/core';
import { InstallerArgsCommands, TauriCommandService } from 'service';
import { InstallerArgs } from '../models/installer-args';

@Injectable({
    providedIn: 'root',
})
export class InstallerArgsService {
    constructor(private tauriCommand: TauriCommandService) {}

    async getInstallerArgs() {
        const args = await this.tauriCommand.invokeCommand<InstallerArgs, undefined>(
            InstallerArgsCommands.GET_INSTALLER_ARGS_COMMAND,
            undefined,
        );
        return args;
    }
}
