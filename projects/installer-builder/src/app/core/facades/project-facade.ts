import { inject, Injectable } from '@angular/core';
import { FileHelper } from '../../shared/helpers/file.helper';
import { ProjectManagerService } from '../services/project-manager-service';
import { ProjectStateService } from '../services/project-state-service';
import { ProjectStore } from '../stores/project-store';
import { DialogStore } from '../stores/dialog.store';
import { ToastService } from 'service';
import { join } from '@tauri-apps/api/path';

@Injectable({
    providedIn: 'root',
})
export class ProjectFacade {
    private projectStore = inject(ProjectStore);
    dialogStore = inject(DialogStore);

    constructor(
        private projectManagerService: ProjectManagerService,
        private projectStateService: ProjectStateService,
        private toastService: ToastService,
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
        const filePath = await join(
            this.projectStore.projectDir(),
            `${this.projectStore.projectName()}.tunins`,
        );

        let project = await this.projectManagerService.openProject(filePath);
        if (!project) {
            return;
        }

        await this.projectStateService.updateProjectState(project.projectDir, project.name);
        await this.projectManagerService.init();

        this.projectStore.updateValues({ changeReload: true });

        setTimeout(() => {
            this.projectStore.updateValues({ changeReload: false });
        }, 0);
    }

    async saveInstallerDocument() {
        const formValid = this.projectManagerService.validateInstallerPropertyDataForm();
        if (!formValid) {
            return;
        }

        if (!this.projectStore.projectFile()) {
            this.dialogStore.update({
                createNewProjectDialog: true,
            });

            return;
        }

        const r = await this.projectManagerService.saveInstallerDocument();
        if (!r) {
            this.toastService.show('Something error', 'error');
            return;
        }

        this.toastService.show('Save', 'success');
    }
}
