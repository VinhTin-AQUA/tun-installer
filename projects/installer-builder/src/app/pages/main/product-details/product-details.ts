import { Component, inject, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ToastService } from 'service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogStore } from '../../../core/stores/dialog.store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ResourceFiletore } from '../../../core/stores/resource-file.store';

@Component({
    selector: 'app-product-details',
    imports: [FormField, FormsModule, TranslatePipe],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    projectManagerService = inject(ProjectManagerService);
    workingConfigFileStore = this.projectManagerService.projectStore;
    installerPropertyStore = this.projectManagerService.installerPropertyStore;
    installerPropertyDataModel = this.projectManagerService.installerPropertyDataModel;
    installerPropertyDataForm = this.projectManagerService.installerPropertyDataForm;

    dialogStore = inject(DialogStore);
    resourceFiletore = inject(ResourceFiletore);

    constructor(private toastService: ToastService) {}

    async ngOnInit() {
    }

    async onSaveInstallerConfig() {
        const formValid = this.projectManagerService.validateInstallerPropertyDataForm();
        if (!formValid) {
            return;
        }

        if (!this.workingConfigFileStore.projectFile()) {
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
