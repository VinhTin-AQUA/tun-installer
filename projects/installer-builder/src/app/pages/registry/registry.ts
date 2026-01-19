import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    InstallerPropertyStore,
    RegistryKeyStore,
    RegistryValue,
    RegistryValueType,
} from 'installer-core';
import { FileStateConfigService } from '../../core/services/file-state-config-service';
import { ToastService } from '../../core/services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-registry',
    imports: [FormsModule, CommonModule],
    templateUrl: './registry.html',
    styleUrl: './registry.css',
})
export class Registry {
    configRegistry = 'Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE'; // + publisher\\appName
    uninstallRegistry =
        'Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall'; //  + publisher\\appName

    configRegistryEntries: RegistryValue[] = [
        { name: 'PostgreSQL', type: RegistryValueType.REG_DWORD, data: '17.5-3' },
        { name: 'MyApp', type: RegistryValueType.REG_DWORD, data: '1' },
    ];

    uninstallRegistryEntries: RegistryValue[] = [
        {
            name: 'PostgreSQL 17',
            type: RegistryValueType.REG_DWORD,
            data: 'C:\\Program Files\\PostgreSQL\\17',
        },
        {
            name: 'MyApp',
            type: RegistryValueType.REG_DWORD,
            data: 'C:\\Program Files\\MyApp',
        },
    ];

    nameSuggestions = ['PostgreSQL', 'MyApp', 'NodeJS', 'Python'];
    typeOptions = Object.values(RegistryValueType);
    dataSuggestions = ['1', '0', 'C:\\Program Files\\', '17.5-3'];
    registryKeyStore = inject(RegistryKeyStore);
    installerPropertyStore = inject(InstallerPropertyStore);
    invalidConfigEntries = signal<string[]>([]);
    invalidUninstallEntries = signal<string[]>([]);

    constructor(
        private fileStateConfigService: FileStateConfigService,
        private toastService: ToastService,
    ) {}

    addConfigEntry() {
        this.configRegistryEntries.push({
            name: '',
            type: RegistryValueType.REG_DWORD,
            data: '',
        });
    }

    addUninstallEntry() {
        this.uninstallRegistryEntries.push({
            name: '',
            type: RegistryValueType.REG_DWORD,
            data: '',
        });
    }

    removeConfigEntry(name: string) {
        const index = this.configRegistryEntries.findIndex((item) => item.name === name);
        if (index !== -1) {
            this.configRegistryEntries.splice(index, 1);
        }
    }

    removeUninstallEntry(name: string) {
        const index = this.uninstallRegistryEntries.findIndex((item) => item.name === name);
        if (index !== -1) {
            this.uninstallRegistryEntries.splice(index, 1);
        }
    }

    async saveEntryConfig() {
        this.invalidConfigEntries.set(
            this.configRegistryEntries
                .filter(
                    (entry) => !entry.name?.trim() || !entry.type || !entry.data?.toString().trim(),
                )
                .map((x) => x.name),
        );

        this.invalidUninstallEntries.set(
            this.uninstallRegistryEntries
                .filter(
                    (entry) => !entry.name?.trim() || !entry.type || !entry.data?.toString().trim(),
                )
                .map((x) => x.name),
        );

        if (this.invalidConfigEntries().length > 0) {
            this.toastService.show('Name, Type and Data are required', 'error');
            return;
        }

        if (this.invalidUninstallEntries().length > 0) {
            this.toastService.show('Name, Type and Data are required', 'error');
            return;
        }

        const registryName = [
            this.installerPropertyStore.publisher(),
            this.installerPropertyStore.productName(),
        ].join('\\');
        const configRegistryPath = `${this.configRegistry}\\${registryName}`;
        const uninstallRegistryPath = `${this.uninstallRegistry}\\${registryName}`;

        this.registryKeyStore.updateRegistry({
            configRegistry: {
                name: registryName,
                path: configRegistryPath,
                values: this.configRegistryEntries,
            },
            uninstallRegistry: {
                name: registryName,
                path: uninstallRegistryPath,
                values: this.uninstallRegistryEntries,
            },
        });

        console.log(this.registryKeyStore.getData());

        const r = await this.fileStateConfigService.saveInstallerConfig('');

        if (r) {
            this.toastService.show('Success', 'success');
        }
    }
}
