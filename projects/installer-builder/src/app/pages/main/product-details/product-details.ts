import { Component, inject, signal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ToastService } from 'service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogStore } from '../../../core/stores/dialog.store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ResourceFiletore } from '../../../core/stores/resource-file.store';
import { TextInput } from '../../../shared/components/text-input/text-input';
import { TextArea } from '../../../shared/components/text-area/text-area';
import { CheckBox } from '../../../shared/components/check-box/check-box';
import { Button } from '../../../shared/components/button/button';
import { Option } from '../../../core/models/option';
import { ProjectStore } from '../../../core/stores/project-store';

@Component({
    selector: 'app-product-details',
    imports: [FormField, FormsModule, TranslatePipe, TextInput, TextArea, CheckBox, Button],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    projectManagerService = inject(ProjectManagerService);
    projectStore = this.projectManagerService.projectStore;
    installerPropertyStore = this.projectManagerService.installerPropertyStore;
    installerPropertyDataModel = this.projectManagerService.installerPropertyDataModel;
    installerPropertyDataForm = this.projectManagerService.installerPropertyDataForm;

    dialogStore = inject(DialogStore);
    resourceFiletore = inject(ResourceFiletore);
    resourceFileOptions: Option[] = [];
    
    constructor(private toastService: ToastService) {}

    async ngOnInit() {
        this.resourceFileOptions = this.resourceFiletore
            .getAll()
            .map((x) => ({ label: x.name, value: x.name }));
    }

    async onSaveInstallerConfig() {
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
