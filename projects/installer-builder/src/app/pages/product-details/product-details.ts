import { Component, effect, inject, signal } from '@angular/core';
import { Field, form, readonly, required } from '@angular/forms/signals';
import { WorkingConfigFileStore } from '../../shared/stores/working-config.store';
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
        private installerConfigService: InstallerConfigService
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

    async ngOnInit() {
        const r = await this.installerConfigService.loadWorkingConfig();
        if (!r) {
            return;
        }
        this.workingConfigFileStore.update(r);

        if (!r.filePath) {
            return;
        }

        const installerDocumentConfig =
            await this.installerConfigService.loadInstallerDocumentConfig(r.filePath);
        if (!installerDocumentConfig) {
            return;
        }

        this.installerPropertyDataForm.comment().value.set('Hello');

        this.installerPropertyDataForm
            .projectDir()
            .value.set(installerDocumentConfig.properties.projectDir);
        this.installerPropertyDataForm
            .installationLocation()
            .value.set(installerDocumentConfig.properties.installationLocation);
        this.installerPropertyDataForm
            .productName()
            .value.set(installerDocumentConfig.properties.productName);
        this.installerPropertyDataForm.icon().value.set(installerDocumentConfig.properties.icon);
        this.installerPropertyDataForm
            .productVersion()
            .value.set(installerDocumentConfig.properties.productVersion);
        this.installerPropertyDataForm
            .publisher()
            .value.set(installerDocumentConfig.properties.publisher);
        this.installerPropertyDataForm
            .supportLink()
            .value.set(installerDocumentConfig.properties.supportLink);
        this.installerPropertyDataForm
            .supportEmail()
            .value.set(installerDocumentConfig.properties.supportEmail);
        this.installerPropertyDataForm
            .comment()
            .value.set(installerDocumentConfig.properties.comment);
        this.installerPropertyDataForm
            .launchFile()
            .value.set(installerDocumentConfig.properties.launchFile);
        this.installerPropertyDataForm
            .runAsAdmin()
            .value.set(installerDocumentConfig.properties.runAsAdmin);
        this.installerPropertyDataForm
            .launchApp()
            .value.set(installerDocumentConfig.properties.launchApp);
        this.installerPropertyDataForm
            .shortcutInDesktop()
            .value.set(installerDocumentConfig.properties.shortcutInDesktop);
        this.installerPropertyDataForm
            .shortcutInApplicationShortcut()
            .value.set(installerDocumentConfig.properties.shortcutInApplicationShortcut);

        this.installerPropertyStore.update({
            projectDir: installerDocumentConfig.properties.projectDir,
            installationLocation: installerDocumentConfig.properties.installationLocation,
            productName: installerDocumentConfig.properties.productName,
            icon: installerDocumentConfig.properties.icon,
            productVersion: installerDocumentConfig.properties.productVersion,
            publisher: installerDocumentConfig.properties.publisher,
            supportLink: installerDocumentConfig.properties.supportLink,
            supportEmail: installerDocumentConfig.properties.supportEmail,
            comment: installerDocumentConfig.properties.comment,
            launchFile: installerDocumentConfig.properties.launchFile,
            runAsAdmin: installerDocumentConfig.properties.runAsAdmin,
            launchApp: installerDocumentConfig.properties.launchApp,
            shortcutInDesktop: installerDocumentConfig.properties.shortcutInDesktop,
            shortcutInApplicationShortcut:
                installerDocumentConfig.properties.shortcutInApplicationShortcut,
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

        const r = await this.installerConfigService.saveInstallerDocumentConfig({
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

        const r2 = await this.installerConfigService.updateWorkingConfig(
            this.workingConfigFileStore.getData()
        );
    }
}
