import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
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
import { ProjectFacade } from '../../../core/facades/project-facade';

@Component({
    selector: 'app-product-details',
    imports: [FormField, FormsModule, TranslatePipe, TextInput, TextArea, CheckBox, Button],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    projectManagerService = inject(ProjectManagerService);
    installerPropertyDataForm = this.projectManagerService.installerPropertyDataForm;

    dialogStore = inject(DialogStore);
    resourceFiletore = inject(ResourceFiletore);
    resourceFileOptions: Option[] = [];
    
    constructor(private projectFacade: ProjectFacade) {}

    async ngOnInit() {
        this.resourceFileOptions = this.resourceFiletore
            .getAll()
            .map((x) => ({ label: x.name, value: x.name }));
    }

    async onSaveInstallerConfig() {
       await this.projectFacade.saveInstallerDocument();
    }
}
