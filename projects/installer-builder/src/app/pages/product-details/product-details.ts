import { Component, inject, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { ToastService } from '../../core/services/toast-service';
import { FolderHelper } from '../../shared/helpers/folder.helper';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectFolders } from '../../core/consts/folder.const';
import { FileStateConfigService } from '../../core/services/file-state-config-service';

@Component({
    selector: 'app-product-details',
    imports: [Field, FormsModule, TranslatePipe],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    fileStateConfigService = inject(FileStateConfigService);
    workingConfigFileStore = this.fileStateConfigService.workingConfigFileStore;
    installerPropertyStore = this.fileStateConfigService.installerPropertyStore;
    installerPropertyDataModel = this.fileStateConfigService.installerPropertyDataModel;
    installerPropertyDataForm = this.fileStateConfigService.installerPropertyDataForm;

    isOpenConfigNameInput = signal<boolean>(false);
    fileName = '';

    constructor(private toastService: ToastService) {}

    async ngOnInit() {
        // await this.fileStateConfigService.openFileConfig(this.workingConfigFileStore.filePath());
    }

    async onSaveInstallerConfig() {
        const formValid = this.formValid();
        if (!formValid) {
            return;
        }

        if (!this.workingConfigFileStore.filePath()) {
            this.workingConfigFileStore.update({
                filePath: 'filePath',
            });
            this.openConfigNameInput();
            return;
        }

        if (!this.fileName) {
            this.toastService.show('Config file name is not empty', 'error');
            return;
        }

        const filePath = `${this.installerPropertyDataForm.projectDir().value()}/${ProjectFolders.configs}/${
            this.fileName
        }.json`;

        this.workingConfigFileStore.update({
            filePath: filePath,
        });

        const r = await this.fileStateConfigService.saveInstallerConfig(this.fileName);

        if (!r) {
            this.toastService.show('Something error', 'error');
            return;
        }

        this.toastService.show('Save', 'success');
        this.closeConfigNameInput();
    }

    async selectFolder(key: 'projectDir' | 'pageDir' | 'installationLocation' | 'sourceDir') {
        const folder = await FolderHelper.selectFolder();

        if (!folder) {
            return;
        }

        switch (key) {
            case 'projectDir':
                this.installerPropertyDataForm.projectDir().setControlValue(folder);
                break;
            case 'installationLocation':
                this.installerPropertyDataForm.installationLocation().setControlValue(folder);
                break;
        }
    }

    openConfigNameInput() {
        this.fileName = '';
        this.isOpenConfigNameInput.set(true);
    }

    closeConfigNameInput() {
        this.isOpenConfigNameInput.set(false);
    }

    private formValid() {
        if (!this.installerPropertyDataForm.projectDir().valid()) {
            const messages = this.installerPropertyDataForm
                .projectDir()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');

            this.toastService.show(messages, 'error');
            return false;
        }

        if (!this.installerPropertyDataForm.projectDir().valid()) {
            const messages = this.installerPropertyDataForm
                .projectDir()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }
        if (!this.installerPropertyDataForm.installationLocation().valid()) {
            const messages = this.installerPropertyDataForm
                .installationLocation()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }
        if (!this.installerPropertyDataForm.productName().valid()) {
            const messages = this.installerPropertyDataForm
                .productName()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }
        if (!this.installerPropertyDataForm.productVersion().valid()) {
            const messages = this.installerPropertyDataForm
                .productVersion()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }
        if (!this.installerPropertyDataForm.publisher().valid()) {
            const messages = this.installerPropertyDataForm
                .publisher()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }

        if (!this.installerPropertyDataForm.launchFile().valid()) {
            const messages = this.installerPropertyDataForm
                .launchFile()
                .errors()
                .map((x) => {
                    return x.message;
                })
                .join(',');
            this.toastService.show(messages, 'error');
            return false;
        }
        return true;
    }
}
