import { inject, Injectable } from '@angular/core';
import { TauriCommandService } from '../tauri/tauri-command-service';
import { ProjectState } from '../models/project-state';
import { ProjectStateCommands } from '../enums/tauri-commands';
import { ProjectStore } from '../store/project-store';

@Injectable({
    providedIn: 'root',
})
export class ProjectStateService {
    projectStore = inject(ProjectStore);

    constructor(private TauriCommandService: TauriCommandService) {}

    async getProjectState() {
        const r = await this.TauriCommandService.invokeCommand<ProjectState, undefined>(
            ProjectStateCommands.GET_PROJECT_STATE_COMMAND,
            undefined,
        );

        if (r) {
            this.projectStore.updateValues(r);
        }
    }
}
