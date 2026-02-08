import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RegistryKey,
    RegistryKeyStore,
    RegistryValueType,
} from 'data-access';
import { ToastService } from '../../core/services/toast-service';
import { CommonModule } from '@angular/common';
import { ProjectManagerService } from '../../core/services/project-manager-service';

@Component({
    selector: 'app-registry',
    imports: [FormsModule, CommonModule],
    templateUrl: './registry.html',
    styleUrl: './registry.css',
})
export class Registry {
    registryTypes = Object.values(RegistryValueType);
    registryKeyStore = inject(RegistryKeyStore);

    registrySections = [
        { label: 'Config Registry', key: this.registryKeyStore.configRegistry() },
        { label: 'Uninstall Registry', key: this.registryKeyStore.uninstallRegistry() },
    ];

    constructor(
        private toastService: ToastService,
        private projectManagerService: ProjectManagerService,
    ) {}

    addValue(key: RegistryKey) {
        key.values.push({
            name: '',
            type: RegistryValueType.REG_SZ,
            data: '',
            default: false,
        });
    }

    removeValue(key: RegistryKey, index: number) {
        key.values.splice(index, 1);
    }

    async save() {
        const configRegistryValues = this.registryKeyStore.configRegistry().values;
        const uninstallRegistryValues = this.registryKeyStore.uninstallRegistry().values;

        const configRegistryEmptyValues = configRegistryValues
            .filter((entry) => !entry.name?.trim() || !entry.type || !entry.data?.toString().trim())
            .map((x) => x.name);

        const uninstallRegistryEmptyValues = uninstallRegistryValues
            .filter((entry) => !entry.name?.trim() || !entry.type || !entry.data?.toString().trim())
            .map((x) => x.name);

        if (configRegistryEmptyValues.length > 0 || uninstallRegistryEmptyValues.length > 0) {
            this.toastService.show('Name, Type and Data are required', 'error');
            return;
        }

        this.registryKeyStore.addValues('configRegistry', this.registrySections[0].key.values);
        this.registryKeyStore.addValues('uninstallRegistry', this.registrySections[1].key.values);

        const r = await this.projectManagerService.saveInstallerDocument();
        if (r) {
            this.toastService.show('Success', 'success');
        }
    }
}
