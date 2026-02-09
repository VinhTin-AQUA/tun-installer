import { Injectable } from '@angular/core';
import {
    CompressCommands,
    HtmlEngineCommands,
    InstallCommands,
    InstallerDocumentCommands,
    ProjectManagerCommands,
    ProjectStateCommands,
    WindowCommands,
} from './commands';
import { invoke, InvokeArgs } from '@tauri-apps/api/core';
import { ToastService } from '../shared';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandService {
    constructor(private toastService: ToastService) {}

    async invokeCommand<T, P extends object | undefined>(
        command:
            | ProjectStateCommands
            | ProjectManagerCommands
            | CompressCommands
            | HtmlEngineCommands
            | InstallerDocumentCommands
            | InstallCommands
            | WindowCommands,
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
