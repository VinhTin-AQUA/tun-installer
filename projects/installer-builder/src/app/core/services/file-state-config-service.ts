import { effect, inject, Injectable, signal } from '@angular/core';
import { WorkingConfigFileStore } from '../../shared/stores/working-config.store';
import { InstallerProperties, InstallerPropertyStore } from 'installer-core';
import { form, required, readonly } from '@angular/forms/signals';
import { TauriCommandService } from './tauri-command-service';
import {
    InstallerDocumentConfig,
    SaveInstallerDocument,
} from '../models/tauri-payloads/save-Installer-document';
import { Commands } from '../enums/commands';
import { WorkingConfigFileState } from '../models/installer-config.model';

@Injectable({
    providedIn: 'root',
})
export class FileStateConfigService {
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

    constructor(private tauriCommandService: TauriCommandService) {
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

    /* ====== private methods ====== */

    async openFileConfig(filePath: string | null = null) {
        if (!filePath) {
            const fileState = await this.getFileState();

            if (!fileState) {
                return;
            }
            this.workingConfigFileStore.update(fileState);
            await this.updateFileState(fileState);

            if (!fileState.filePath) {
                return;
            }
        } else {
            this.workingConfigFileStore.update({ filePath: filePath });
            await this.updateFileState({ content: '', filePath: filePath ?? '', isDirty: false });
        }

        const installerDocumentConfig = await this.loadFileContent(
            this.workingConfigFileStore.filePath()!
        );

        if (!installerDocumentConfig) {
            return;
        }

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

    /* ====== state ====== */

    async getFileState() {
        const r = await this.tauriCommandService.invokeCommand<WorkingConfigFileState>(
            Commands.LOAD_WORKING_CONFIG_COMMAND,
            {}
        );
        return r;
    }

    async updateFileState(data: WorkingConfigFileState): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.UPDATE_WORKING_CONFIG_COMMAND,
            { data: data }
        );
        return r ?? false;
    }

    /* ====== content ====== */

    async loadFileContent(filePath: string) {
        const r = await this.tauriCommandService.invokeCommand<InstallerDocumentConfig>(
            Commands.LOAD_INSTALLER_DOCUMENT_CONFIG_COMMAND,
            { filePath: filePath }
        );
        return r;
    }

    async updateFileContent(data: SaveInstallerDocument): Promise<boolean> {
        const r = await this.tauriCommandService.invokeCommand<boolean>(
            Commands.SAVE_INSTALLER_CONFIG_COMMAND,
            data
        );
        return r ?? false;
    }
}
