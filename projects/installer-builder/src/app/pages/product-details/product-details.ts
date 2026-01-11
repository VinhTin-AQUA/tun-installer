import { Component, inject, signal } from '@angular/core';
import { Field, form, readonly, required } from '@angular/forms/signals';
import { WorkingConfigFileStore } from '../../shared/stores/installer-document.store';
import { ToastService } from '../../core/services/toast-service';
import { InstallerConfigService } from '../../core/services/installer-config-service';
import { InstallerPropertyStore, InstallerProperties } from 'installer-core';
import { FolderHelper } from '../../core/helpers/folder.helper';

@Component({
    selector: 'app-product-details',
    imports: [Field],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    workingConfigFileStore = inject(WorkingConfigFileStore);
    installerPropertyStore = inject(InstallerPropertyStore);
    installerPropertyDataModel = signal<InstallerProperties>(this.installerPropertyStore.getData());

    installerPropertyDataForm = form(this.installerPropertyDataModel, (f) => {
        required(f.projectDir, { message: 'Project Directory is required' });
        readonly(f.projectDir);
        required(f.pageDir, { message: 'Page Directory is required' });
        required(f.installationLocation, { message: 'Installation Location is required' });
        required(f.productName, { message: 'Product Name is required' });
        // required(f.icon);
        required(f.productVersion, { message: 'Product Version is required' });
        required(f.publisher, { message: 'Publisher is required' });
        // required(f.supportLink);
        // required(f.supportEmail);
        // required(f.comment);
        required(f.sourceDir, { message: 'Source Directory is required' });
        required(f.launchFile, { message: 'Launch File is required' });
        // required(f.runAsAdmin);
        // required(f.launchApp);
    });

    constructor(
        private toastService: ToastService,
        private installerDocumentService: InstallerConfigService
    ) {}

    onInputChanged() {
        this.workingConfigFileStore.update({
            isDirty: true,
        });
    }

    // submit() {
    //     const credentials = this.installerPropertyDataForm().value();
    //     console.log('Logging in with:', credentials);

    // }

    async saveInstallerDocument() {
        const formValid = this.formValid();
        if (!formValid) {
            return;
        }

        await this.installerDocumentService.saveDocument({
            filePath: '',
            payload: this.installerPropertyStore.getData(),
        });
    }

    async selectFolder(key: 'projectDir' | 'pageDir' | 'installationLocation' | 'sourceDir') {
        const folder = await FolderHelper.selectFolder();

        if (!folder) {
            this.toastService.show('Error when select folder. Please again', 'error');
            return;
        }

        switch (key) {
            case 'projectDir':
                this.installerPropertyDataForm.projectDir().setControlValue(folder);
                break;
            case 'pageDir':
                this.installerPropertyDataForm.pageDir().setControlValue(folder);
                break;
            case 'installationLocation':
                this.installerPropertyDataForm.installationLocation().setControlValue(folder);
                break;
            case 'sourceDir':
                this.installerPropertyDataForm.sourceDir().setControlValue(folder);
                break;
        }
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
        if (!this.installerPropertyDataForm.pageDir().valid()) {
            const messages = this.installerPropertyDataForm
                .pageDir()
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
        if (!this.installerPropertyDataForm.sourceDir().valid()) {
            const messages = this.installerPropertyDataForm
                .sourceDir()
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
