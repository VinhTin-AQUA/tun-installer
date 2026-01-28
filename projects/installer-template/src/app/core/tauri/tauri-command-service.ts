import { Injectable } from '@angular/core';
import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { HtmlEngineCommands, InstallerDocumentCommands, ProjectStateCommands } from '../enums/tauri-commands';
import { ToastService } from '../services/toast-service';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    constructor(private toastService: ToastService) {}

    async invokeCommand<T, P extends object | undefined>(
        command: InstallerDocumentCommands | ProjectStateCommands | HtmlEngineCommands,
        params: P,
    ): Promise<T | null> {
        try {
            const initOk = await invoke<T>(command, params as InvokeArgs | undefined);
            return initOk;
        } catch (e: any) {
            this.toastService.show(e.toString(), 'error');
            console.log(command, e.toString());

            return null;
        }
    }
}
