import { Injectable } from '@angular/core';
import { TauriCommandService } from '../tauri/tauri-command-service';
import { WindowCommands } from '../tauri/commands';

@Injectable({
    providedIn: 'root',
})
export class WindowService {
    constructor(private tauriCommandService: TauriCommandService) {}

    async closeCurrentWindow() {
        await this.tauriCommandService.invokeCommand<void, undefined>(
            WindowCommands.CLOSE_CURRENT_WINDOW,
            undefined,
        );
    }
}
