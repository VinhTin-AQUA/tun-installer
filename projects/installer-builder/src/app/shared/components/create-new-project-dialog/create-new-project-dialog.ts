import { booleanAttribute, Component, inject, signal } from '@angular/core';
import { DialogStore } from '../../stores/dialog.store';
import { Field, form, readonly, required } from '@angular/forms/signals';
import { FolderHelper } from '../../helpers/folder.helper';
import { TauriCommandService } from '../../../core/services/tauri-command-service';
import { Commands } from '../../../core/enums/commands';
import { CreateTunInstallerProject } from '../../../core/models/tauri-payloads/create-tuninstaller-project';
import { ToastService } from '../../../core/services/toast-service';
import { WorkingConfigFileStore } from '../../stores/working-config.store';
import { ProjectFolders } from '../../../core/consts/folder.const';
import { FileStateConfigService } from '../../../core/services/file-state-config-service';
import { WorkingConfigFileState } from '../../../core/models/working-config-file-state';

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

    workingConfigFileStore = inject(WorkingConfigFileStore);

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private fileStateConfigService: FileStateConfigService,
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
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.CREATE_TUNINSTALLER_PROJECT_COMMAND,
            this.data(),
        );

        if (!r) {
            return;
        }
        this.toastService.show('Success', 'success');

        const workingConfigFileState: WorkingConfigFileState = {
            configDir: `${this.data().baseDir}/${this.data().projectName}/${ProjectFolders.configs}`,
            pageDir: `${this.data().baseDir}/${this.data().projectName}/${ProjectFolders.pages}`,
            prerequisiteDir: `${this.data().baseDir}/${this.data().projectName}/${ProjectFolders.prerequisites}`,
            resourceDir: `${this.data().baseDir}/${this.data().projectName}/${ProjectFolders.resources}`,

            projectDir: `${this.data().baseDir}/${this.data().projectName}`,
            configFile: `${this.data().baseDir}/${this.data().projectName}/${ProjectFolders.configs}/config.json`,
            projectFile: `${this.data().baseDir}/${this.data().projectName}/${this.data().projectName}.tunins`,
            isDirty: false,
        };

        this.workingConfigFileStore.update(workingConfigFileState);
        await this.fileStateConfigService.saveInstallerConfig();
        await this.fileStateConfigService.updateFileState(workingConfigFileState);
        // await this.fileStateConfigService.init();
        this.dialogStore.update({
            createNewProjectDialog: false,
        });

        this.data.set({
            baseDir: '',
            projectName: '',
        });
    }
}
