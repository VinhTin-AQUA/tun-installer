import { effect, inject, Injectable, signal } from '@angular/core';
import { WorkingConfigFileStore } from '../../shared/stores/working-config.store';
import { InstallerProperties, InstallerPropertyStore, RegistryKeyStore } from 'installer-core';
import { form, required } from '@angular/forms/signals';
import { TauriCommandService } from './tauri-command-service';
import {
    InstallerDocumentConfig,
    SaveInstallerDocument,
} from '../models/tauri-payloads/save-Installer-document';
import { Commands } from '../enums/commands';
import { WorkingConfigFileState } from '../models/working-config-file-state';

@Injectable({
    providedIn: 'root',
})
export class FileStateConfigService {
    workingConfigFileStore = inject(WorkingConfigFileStore);
    installerPropertyStore = inject(InstallerPropertyStore);
    installerPropertyDataModel = signal<InstallerProperties>(this.installerPropertyStore.getData());
    registryKeyStore = inject(RegistryKeyStore);

    installerPropertyDataForm = form(this.installerPropertyDataModel, (f) => {
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

    constructor(private tauriCommandService: TauriCommandService) {
        effect(() => {
            const projectDir = this.installerPropertyDataModel().comment;

            this.workingConfigFileStore.update({
                isDirty: true,
            });

            this.installerPropertyStore.update({
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

    /* ====== private methods ====== */

    /* ====== state ====== */

    async getWorkingConfigFileState() {
        const r = await this.tauriCommandService.invokeCommand<WorkingConfigFileState>(
            Commands.LOAD_WORKING_CONFIG_COMMAND,
            {},
        );
        return r;
    }

    async updateFileState(data: WorkingConfigFileState): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.UPDATE_WORKING_CONFIG_COMMAND,
            { data: data },
        );
        return r ?? false;
    }

    /* ====== content ====== */

    async init() {
        const workingConfigFileState = await this.getWorkingConfigFileState();

        if (!workingConfigFileState?.projectDir) {
            return;
        }

        this.workingConfigFileStore.update(workingConfigFileState);
        const installerDocumentConfig = await this.loadInstallerDocumentConfig(
            this.workingConfigFileStore.configFile(),
        );

        if (!installerDocumentConfig) {
            return;
        }

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

        this.registryKeyStore.updateRegistry({
            configRegistry: installerDocumentConfig.registryKeys.configRegistry,
            uninstallRegistry: installerDocumentConfig.registryKeys.uninstallRegistry,
        });
    }

    async saveInstallerConfig(): Promise<boolean> {
        const filePath = this.workingConfigFileStore.configFile();

        const data: SaveInstallerDocument = {
            filePath: filePath,
            payload: {
                properties: this.installerPropertyStore.getData(),
                registryKeys: this.registryKeyStore.getData(),
            },
        };

        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.SAVE_INSTALLER_CONFIG_COMMAND,
            data,
        );

        if (!r) {
            return false;
        }

        this.workingConfigFileStore.update({
            isDirty: false,
        });

        const r2 = await this.updateFileState(this.workingConfigFileStore.getData());
        return true;
    }

    private async loadInstallerDocumentConfig(filePath: string) {
        const r = await this.tauriCommandService.invokeCommand<InstallerDocumentConfig>(
            Commands.LOAD_INSTALLER_DOCUMENT_CONFIG_COMMAND,
            { filePath: filePath },
        );
        return r;
    }
}
