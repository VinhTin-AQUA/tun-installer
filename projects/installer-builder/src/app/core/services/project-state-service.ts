import { inject, Injectable } from '@angular/core';
import { ProjectStore } from '../stores/project-store';
import { TauriCommandService } from './tauri-command-service';
import { ProjectState } from '../models/project-state';
import { ProjectStateCommands } from '../enums/commands';

@Injectable({
    providedIn: 'root',
})
export class ProjectStateService {
    projectStore = inject(ProjectStore);

    constructor(private tauriCommandService: TauriCommandService) {}

    async getProjectState() {
        const r = await this.tauriCommandService.invokeCommand<ProjectState>(
            ProjectStateCommands.LOAD_PROJECT_STATE_COMMAND,
            {},
        );
        if (!r) {
            return null;
        }

        this.projectStore.updateValues(r);
        return r;
    }

    async updateProjectState(baseDir: string, projectName: string) {
        this.projectStore.updateAll(baseDir, projectName);

        const r = await this.tauriCommandService.invokeCommand<boolean>(
            ProjectStateCommands.UPDATE_PROJECT_STATE_COMMAND,
            { data: this.projectStore.getData() },
        );
        return r;
    }
}
