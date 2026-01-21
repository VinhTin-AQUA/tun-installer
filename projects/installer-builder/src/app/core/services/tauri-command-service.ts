import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { ToastService } from './toast-service';
import {
    CompressCommands,
    HtmlEngineCommands,
    ProjectManagerCommands,
    ProjectStateCommands,
} from '../enums/commands';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    constructor(private toastService: ToastService) {}

    async invokeCommand<T>(
        command:
            | ProjectStateCommands
            | ProjectManagerCommands
            | CompressCommands
            | HtmlEngineCommands,
        params: any,
    ): Promise<T | null> {
        try {
            const initOk = await invoke<T>(command, params);
            return initOk;
        } catch (e: any) {
            this.toastService.show(e.toString(), 'error');
            console.log(command, e.toString());

            return null;
        }
    }
}
