import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistryKey, RegistryKeyStore, RegistryValueType } from 'data-access';
import { ToastService } from 'service';
import { CommonModule } from '@angular/common';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { Button } from '../../../shared/components/button/button';
import { TextInput } from '../../../shared/components/text-input/text-input';
import { Select } from '../../../shared/components/select/select';
import { Option } from '../../../core/models/option';
import { Badge } from '../../../shared/components/badge/badge';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-registry',
    imports: [FormsModule, CommonModule, Button, TextInput, Select, Badge, TranslatePipe],
    templateUrl: './registry.html',
    styleUrl: './registry.css',
})
export class Registry {
    registryTypeOptions: Option[] = [
        { label: RegistryValueType.REG_NONE, value: RegistryValueType.REG_NONE },
        { label: RegistryValueType.REG_SZ, value: RegistryValueType.REG_SZ },
        { label: RegistryValueType.REG_EXPAND_SZ, value: RegistryValueType.REG_EXPAND_SZ },
        { label: RegistryValueType.REG_DWORD, value: RegistryValueType.REG_DWORD },
        { label: RegistryValueType.REG_QWORD, value: RegistryValueType.REG_QWORD },
        { label: RegistryValueType.REG_BINARY, value: RegistryValueType.REG_BINARY },
        { label: RegistryValueType.REG_MULTI_SZ, value: RegistryValueType.REG_MULTI_SZ },
    ];

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
