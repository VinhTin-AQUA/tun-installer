import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { Commands } from '../enums/commands';
import { ToastService } from './toast-service';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    constructor(private toastService: ToastService) {}

    async invokeCommand<T>(command: Commands, params: any): Promise<T | null> {
        try {
            const initOk = await invoke<T>(command, params);
            return initOk;
        } catch (e: any) {
            this.toastService.show(e.toString(), 'error');
            console.log(e.toString());
            
            return null;
        }
    }
}
