import { Component, effect, inject, signal } from '@angular/core';
import { Field, form, readonly, required } from '@angular/forms/signals';
import { WorkingConfigFileStore } from '../../shared/stores/installer-document.store';
import { ToastService } from '../../core/services/toast-service';
import { InstallerConfigService } from '../../core/services/installer-config-service';
import { InstallerPropertyStore, InstallerProperties } from 'installer-core';
import { FolderHelper } from '../../shared/helpers/folder.helper';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectFolders } from '../../core/consts/folder.const';

@Component({
    selector: 'app-product-details',
    imports: [Field, FormsModule, TranslatePipe],
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
        required(f.installationLocation, { message: 'Installation Location is required' });
        required(f.productName, { message: 'Product Name is required' });
        // required(f.icon);
        required(f.productVersion, { message: 'Product Version is required' });
        required(f.publisher, { message: 'Publisher is required' });
        // required(f.supportLink);
        // required(f.supportEmail);
        // required(f.comment);
        required(f.launchFile, { message: 'Launch File is required' });
        // required(f.runAsAdmin);
        // required(f.launchApp);
    });

    isOpenConfigNameInput = signal<boolean>(false);
    fileName = '';

    constructor(
        private toastService: ToastService,
        private installerDocumentService: InstallerConfigService
    ) {
        effect(() => {
            const projectDir = this.installerPropertyDataModel().projectDir;

            this.workingConfigFileStore.update({
                isDirty: true,
            });

            this.installerPropertyStore.update({
                projectDir: projectDir,
                installationLocation: this.installerPropertyDataModel().installationLocation,
                productName: this.installerPropertyDataModel().productName,
                icon: this.installerPropertyDataModel().icon,
                productVersion: this.installerPropertyDataModel().productVersion,
                publisher: this.installerPropertyDataModel().publisher,
                supportLink: this.installerPropertyDataModel().supportLink,
                supportEmail: this.installerPropertyDataModel().supportEmail,
                comment: this.installerPropertyDataModel().comment,
                launchFile: this.installerPropertyDataModel().launchFile,
                runAsAdmin: this.installerPropertyDataModel().runAsAdmin,
                launchApp: this.installerPropertyDataModel().launchApp,
                shortcutInDesktop: this.installerPropertyDataModel().shortcutInDesktop,
                shortcutInApplicationShortcut:
                    this.installerPropertyDataModel().shortcutInApplicationShortcut,
            });
        });
    }

    async onSaveInstallerConfig() {
        const formValid = this.formValid();
        if (!formValid) {
            return;
        }

        if (!this.workingConfigFileStore.filePath()) {
            this.openConfigNameInpu();
            return;
        }

        await this.saveInstallerConfig(this.workingConfigFileStore.filePath());
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
            case 'installationLocation':
                this.installerPropertyDataForm.installationLocation().setControlValue(folder);
                break;
        }
    }

    openConfigNameInpu() {
        this.fileName = '';
        this.isOpenConfigNameInput.set(true);
    }

    closeConfigNameInput() {
        this.isOpenConfigNameInput.set(false);
    }

    async confirmConfigNameInput() {
        if (!this.fileName.trim()) return;
        this.closeConfigNameInput();
        await this.saveInstallerConfig(null);
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

    private async saveInstallerConfig(filePath: string | null) {
        const f =
            filePath ??
            `${this.installerPropertyDataForm.projectDir().value()}/${ProjectFolders.configs}/${
                this.fileName
            }.json`;

        const r = await this.installerDocumentService.saveDocument({
            filePath: f,
            payload: {
                properties: { ...this.installerPropertyStore.getData() },
            },
        });

        if (!r) {
            this.toastService.show('Something error', 'error');
            return;
        }
        this.toastService.show('Save', 'success');
        this.workingConfigFileStore.update({
            content: '',
            filePath: f,
            isDirty: false,
        });
    }
}
