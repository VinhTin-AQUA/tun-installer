import { Component, inject, signal } from '@angular/core';
import { DialogStore } from '../../../core/stores/dialog.store';
import { FormField, form, readonly, required } from '@angular/forms/signals';
import { FolderHelper } from '../../helpers/folder.helper';
import { CreateTunInstallerProject } from '../../../core/models/tauri-payloads/create-tuninstaller-project';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';
import { ToastService } from 'service';
import { Router } from '@angular/router';
import { MainRoutes } from '../../../core/enums/routes.enum';
import { join } from '@tauri-apps/api/path';

@Component({
    selector: 'app-create-new-project-dialog',
    imports: [FormField],
    templateUrl: './create-new-project-dialog.html',
    styleUrl: './create-new-project-dialog.css',
})
export class CreateNewProjectDialog {
    dialogStore = inject(DialogStore);
    data = signal<CreateTunInstallerProject>({
        baseDir: '',
        projectName: '',
    });

    form = form(this.data, (f) => {
        required(f.baseDir, { message: 'Location is required' });
        readonly(f.baseDir);
        required(f.projectName, { message: 'Project Name is required' });
    });

    projectStore = inject(ProjectStore);

    constructor(
        private toastService: ToastService,
        private projectManagerService: ProjectManagerService,
        private projectStateService: ProjectStateService,
        private router: Router,
    ) {}

    closeDialog() {
        this.dialogStore.update({ createNewProjectDialog: false });
    }

    async onSelectLocation() {
        const location = await FolderHelper.selectFolder();
        if (!location) {
            return;
        }
        this.form.baseDir().value.set(location);
    }

    async save() {
        if (!this.data().baseDir || !this.data().baseDir) {
            this.toastService.show(
                'Please choose project location and input project name',
                'error',
            );
            return;
        }
        const r = await this.projectManagerService.createNewProject(this.data());
        if (!r) {
            return;
        }
        this.toastService.show('Success', 'success');

        const baseDir = await join(this.data().baseDir, this.data().projectName);
        await this.projectStateService.updateProjectState(baseDir, this.data().projectName);

        // await this.projectManagerService.saveInstallerDocument();
        await this.projectManagerService.init();
        this.dialogStore.update({
            createNewProjectDialog: false,
        });

        this.data.set({
            baseDir: '',
            projectName: '',
        });

        console.log(this.projectStore.getData());

        this.router.navigateByUrl(`${MainRoutes.Main}/${MainRoutes.ProductDetails}`);
    }
}
