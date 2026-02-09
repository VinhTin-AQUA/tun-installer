import { Injectable } from '@angular/core';
import { CompressCommands, TauriCommandService } from 'service';

@Injectable({
    providedIn: 'root',
})
export class CompressService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async extractResourcesAndPrerequsistes(folders: string[]) {
        const r = await this.tauriCommandService.invokeCommand<boolean, object>(
            CompressCommands.EXTRACT_INSTALLER_COMMAND,
            { folders: folders },
        );
        return r;
    }
}
