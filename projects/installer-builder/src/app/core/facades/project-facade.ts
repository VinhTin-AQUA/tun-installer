import { inject, Injectable } from '@angular/core';
import { FileHelper } from '../../shared/helpers/file.helper';
import { ProjectManagerService } from '../services/project-manager-service';
import { ProjectStateService } from '../services/project-state-service';
import { ProjectStore } from '../stores/project-store';

@Injectable({
    providedIn: 'root',
})
export class ProjectFacade {
    private projectStore = inject(ProjectStore);

    constructor(
        private projectManagerService: ProjectManagerService,
        private projectStateService: ProjectStateService,
    ) {}

    async openProject() {
        const filePath = await FileHelper.selectFile([
            { name: 'Tun Installer', extensions: ['tunins'] },
        ]);

        if (!filePath) {
            return;
        }
        let project = await this.projectManagerService.openProject(filePath);
        if (!project) {
            return;
        }

        await this.projectStateService.updateProjectState(project.projectDir, project.name);
        await this.projectManagerService.init();
    }

    async refresh() {
        // const filePath = await join(
        //     this.projectStore.projectDir(),
        //     `${this.projectStore.projectName()}.tunins`,
        // );

        // let project = await this.projectManagerService.openProject(filePath);
        // if (!project) {
        //     return;
        // }

        // await this.projectStateService.updateProjectState(project.projectDir, project.name);
        // await this.projectManagerService.init();
        
        this.projectStore.updateValues({ changeReload: true });

        setTimeout(() => {
            this.projectStore.updateValues({ changeReload: false });
        },0);
    }
}
