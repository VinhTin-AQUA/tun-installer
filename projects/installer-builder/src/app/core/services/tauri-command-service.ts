import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { Commands } from '../enums/commands';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    static readonly INIT_GOOGLE_SHEET_COMMAND = 'init_google_sheet_command';

    async invokeCommand<T>(command: Commands, params: any): Promise<T | null> {
        try {
            const initOk = await invoke<T>(command, params);
            return initOk;
        } catch (e) {
            alert(e);
            return null;
        }
    }
}
