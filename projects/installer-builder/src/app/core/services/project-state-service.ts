import { inject, Injectable } from '@angular/core';
import { ProjectStore } from '../stores/project-store';
import { ProjectState } from '../models/project-state';
import { ProjectStateCommands, TauriCommandService } from 'tauri';

@Injectable({
    providedIn: 'root',
})
export class ProjectStateService {
    projectStore = inject(ProjectStore);

    constructor(private tauriCommandService: TauriCommandService) {}

    async getProjectState() {
        const r = await this.tauriCommandService.invokeCommand<ProjectState, undefined>(
            ProjectStateCommands.LOAD_PROJECT_STATE_COMMAND,
            undefined,
        );
        if (!r) {
            return null;
        }

        this.projectStore.updateValues(r);
        return r;
    }

    async updateProjectState(baseDir: string, projectName: string) {
        this.projectStore.updateDir(baseDir, projectName);

        const r = await this.tauriCommandService.invokeCommand<boolean, object>(
            ProjectStateCommands.UPDATE_PROJECT_STATE_COMMAND,
            { data: this.projectStore.getData() },
        );
        return r;
    }
}
