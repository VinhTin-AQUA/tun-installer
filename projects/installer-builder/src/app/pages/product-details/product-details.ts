import { Component, inject, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { ToastService } from '../../core/services/toast-service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FileStateConfigService } from '../../core/services/file-state-config-service';
import { DialogStore } from '../../shared/stores/dialog.store';

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

    dialogStore = inject(DialogStore);

    constructor(private toastService: ToastService) {}

    async ngOnInit() {
        // await this.fileStateConfigService.openFileConfig(this.workingConfigFileStore.filePath());
    }

    async onSaveInstallerConfig() {
        const formValid = this.formValid();
        if (!formValid) {
            return;
        }

        if (!this.workingConfigFileStore.projectFile()) {
            this.dialogStore.update({
                createNewProjectDialog: true,
            });

            return;
        }

        const r = await this.fileStateConfigService.saveInstallerConfig();
        if (!r) {
            this.toastService.show('Something error', 'error');
            return;
        }

        this.toastService.show('Save', 'success');
    }

    private formValid() {
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
