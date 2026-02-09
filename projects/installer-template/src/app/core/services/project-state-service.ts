import { inject, Injectable } from '@angular/core';
import { ProjectState } from '../models/project-state';
import { ProjectStore } from '../store/project-store';
import { ProjectStateCommands, TauriCommandService } from 'service';

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
