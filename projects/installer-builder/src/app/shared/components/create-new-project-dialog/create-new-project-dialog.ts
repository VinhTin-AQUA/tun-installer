import { Component, inject, signal } from '@angular/core';
import { DialogStore } from '../../../core/stores/dialog.store';
import { Field, form, readonly, required } from '@angular/forms/signals';
import { FolderHelper } from '../../helpers/folder.helper';
import { CreateTunInstallerProject } from '../../../core/models/tauri-payloads/create-tuninstaller-project';
import { ToastService } from '../../../core/services/toast-service';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';

@Component({
    selector: 'app-create-new-project-dialog',
    imports: [Field],
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

    workingConfigFileStore = inject(ProjectStore);

    constructor(
        private toastService: ToastService,
        private projectManagerService: ProjectManagerService,
        private projectStateService: ProjectStateService,
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
        const r = await this.projectManagerService.createNewProject(this.data());
        if (!r) {
            return;
        }
        this.toastService.show('Success', 'success');

        await this.projectStateService.updateProjectState(
            this.data().baseDir,
            this.data().projectName,
        );

        // await this.projectManagerService.saveInstallerDocument();
        await this.projectManagerService.init();
        this.dialogStore.update({
            createNewProjectDialog: false,
        });

        this.data.set({
            baseDir: '',
            projectName: '',
        });
    }
}
