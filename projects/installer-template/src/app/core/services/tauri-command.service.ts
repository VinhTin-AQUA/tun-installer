import { Injectable } from '@angular/core';
import { TauriCommand } from '../enums/tauri-command.enum';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    async invokeCommand<T>(tauriCommand: TauriCommand, params: any): Promise<T | null> {
        try {
            const initOk = await invoke<T>(tauriCommand, params);
            return initOk;
        } catch (e) {
            alert('tauriCommandService error: ' + e);
            return null;
        }
    }
}
