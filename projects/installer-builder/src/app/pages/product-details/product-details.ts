import { Component, inject, signal } from '@angular/core';
import { InstallerPropertyData } from './models/installer-property-data';
import { Field, form, required } from '@angular/forms/signals';
import { InstallerDocumentStore } from '../../shared/stores/installer-document.store';
import { ToastService } from '../../core/services/toast-service';

@Component({
    selector: 'app-product-details',
    imports: [Field],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    installerPropertyDataModel = signal<InstallerPropertyData>({
        projectDir: '',
        pageDir: '',
        installationLocation: 'C:\\ProgramFiles',
        productName: 'My App',
        icon: '',
        productVersion: '1.0.0',
        publisher: 'Your Company',
        supportLink: '',
        supportEmail: '',
        comment: '',
        sourceDir: '',
        launchFile: '',
        runAsAdmin: false,
        launchApp: false,
        shortcutInDesktopData: {
            isCreated: false,
            runAsAdmin: false,
            runFile: '',
            shortcutName: '',
        },
        shortcutInApplicationShortcutData: {
            isCreated: false,
            runAsAdmin: false,
            runFile: '',
            shortcutName: '',
        },
    });

    installerDocumentStore = inject(InstallerDocumentStore);

    installerPropertyDataForm = form(this.installerPropertyDataModel, (f) => {
        required(f.projectDir, { message: 'Project Directory is required' });
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

    constructor(private toastService: ToastService) {}



    onInputChanged() {
        this.installerDocumentStore.update({
            isDirty: true,
        });
    }

    submit() {
        const credentials = this.installerPropertyDataForm().value();
        console.log('Logging in with:', credentials);

        
    }

    saveInstallerDocument() {
        console.log(123);
        
        this.toastService.show("HELL", 'success')
    }
}
