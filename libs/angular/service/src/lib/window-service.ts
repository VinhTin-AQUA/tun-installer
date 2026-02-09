import { Injectable } from '@angular/core';
import { TauriCommandService, WindowCommands } from 'tauri';

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
