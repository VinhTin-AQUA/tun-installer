import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ProjectStore } from '../stores/project-store';
import {
    InstallerProperties,
    InstallerPropertyStore,
    Prerequisite,
    PrerequisiteStore,
    RegistryKeys,
    RegistryKeyStore,
    RegistryValue,
    RegistryValueType,
    WindowInfoStore,
} from 'data-access';
import { ProjectManagerCommands, TauriCommandService } from 'service';
import { form, readonly, required } from '@angular/forms/signals';
import {
    InstallerConfig,
    SaveInstallerConfig,
} from '../models/tauri-payloads/save-Installer-document';
import { CreateTunInstallerProject } from '../models/tauri-payloads/create-tuninstaller-project';
import { TunInstallerProject } from '../models/tun-installer-project';
import { ResourceFiletore } from '../stores/resource-file.store';
import { FileItem, FolderNode } from '../models/directory-tree';

@Injectable({
    providedIn: 'root',
})
export class ProjectManagerService {
    projectStore = inject(ProjectStore);
    installerPropertyStore = inject(InstallerPropertyStore);
    installerPropertyDataModel = signal<InstallerProperties>(this.installerPropertyStore.getData());
    registryKeyStore = inject(RegistryKeyStore);
    resourceFiletore = inject(ResourceFiletore);
    windowInfoStore = inject(WindowInfoStore);
    prerequisiteStore = inject(PrerequisiteStore);

    installerPropertyDataForm = form(this.installerPropertyDataModel, (f) => {
        required(f.installationLocation, { message: 'Installation Location is required' });
        readonly(f.installationLocation);
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

            untracked(() => {
                this.projectStore.updateValues({
                    isDirty: true,
                });

                this.installerPropertyStore.update({
                    installationLocation: `C:\\Program Files\\${this.installerPropertyDataModel().publisher}\\${this.installerPropertyDataModel().productName}`,
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

                const configRegistry: RegistryValue[] = [
                    {
                        name: 'InstallPath',
                        type: RegistryValueType.REG_SZ,
                        data: `C:\\Program Files\\${this.installerPropertyDataModel().publisher}\\${this.installerPropertyDataModel().productName}`,
                        default: true,
                    },
                    {
                        name: 'Version',
                        type: RegistryValueType.REG_SZ,
                        data: this.installerPropertyDataModel().productVersion,
                        default: true,
                    },
                    {
                        name: 'DisplayName',
                        type: RegistryValueType.REG_SZ,
                        data: this.installerPropertyDataModel().productName,
                        default: true,
                    },
                ];

                const uninstallRegistry: RegistryValue[] = [
                    {
                        name: 'DisplayName',
                        type: RegistryValueType.REG_SZ,
                        data: this.installerPropertyDataModel().productName,
                        default: true,
                    },
                    {
                        name: 'Publisher',
                        type: RegistryValueType.REG_SZ,
                        data: this.installerPropertyDataModel().publisher,
                        default: true,
                    },
                    {
                        name: 'DisplayVersion',
                        type: RegistryValueType.REG_SZ,
                        data: this.installerPropertyDataModel().productVersion,
                        default: true,
                    },
                    {
                        name: 'UninstallString',
                        type: RegistryValueType.REG_SZ,
                        data: `C:\\Program Files\\${this.installerPropertyDataModel().publisher}\\${this.installerPropertyDataModel().productName}\\uninstall.exe`,
                        default: true,
                    },
                ];

                this.registryKeyStore.updateDefaultRegistryValue(configRegistry, uninstallRegistry);
                this.registryKeyStore.setRegistry({
                    configRegistry: {
                        ...this.registryKeyStore.getData().configRegistry,
                        path: `HKEY_LOCAL_MACHINE\\SOFTWARE\\${this.installerPropertyDataModel().publisher}\\${this.installerPropertyDataModel().productName}`,
                    },
                    uninstallRegistry: {
                        ...this.registryKeyStore.getData().uninstallRegistry,
                        path: `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${this.installerPropertyDataModel().productName}`,
                    },
                });

                const registryKeyStoreUpdatePath: RegistryKeys = {
                    configRegistry: {
                        ...this.registryKeyStore.configRegistry(),
                    },
                    uninstallRegistry: {
                        ...this.registryKeyStore.uninstallRegistry(),
                    },
                };

                this.registryKeyStore.setRegistry(registryKeyStoreUpdatePath);
            });
        });
    }

    async init() {
        if (!this.projectStore.projectDir) {
            return;
        }

        const installerDocumentConfig = await this.loadInstallerDocumentConfig(
            this.projectStore.configFile(),
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

        this.registryKeyStore.setRegistry({
            configRegistry: installerDocumentConfig.registryKeys.configRegistry,
            uninstallRegistry: installerDocumentConfig.registryKeys.uninstallRegistry,
        });

        this.windowInfoStore.setWindows(installerDocumentConfig.windowInfos);
        this.prerequisiteStore.setList(installerDocumentConfig.prerequisites);

        /* =========== get files in resources ==============  */
        await this.getResourceFiles();
    }

    //========== project ===========

    async createNewProject(data: CreateTunInstallerProject) {
        const r = await this.tauriCommandService.invokeCommand<boolean, CreateTunInstallerProject>(
            ProjectManagerCommands.CREATE_TUNINSTALLER_PROJECT_COMMAND,
            data,
        );
        return r;
    }

    async openProject(projectPath: string) {
        const r = await this.tauriCommandService.invokeCommand<TunInstallerProject, object>(
            ProjectManagerCommands.OPEN_TUNINSTALLER_PROJECT_COMMAND,
            {
                projectPath: projectPath,
            },
        );

        if (!r) {
            return;
        }

        this.projectStore.updateValues({
            projectDir: r.projectDir,
            projectName: r.name,
        });

        return r;
    }

    //========== installer config ============

    async saveInstallerDocument(): Promise<boolean> {
        const filePath = this.projectStore.configFile();

        const data: SaveInstallerConfig = {
            filePath: filePath,
            payload: {
                properties: this.installerPropertyStore.getData(),
                registryKeys: this.registryKeyStore.getData(),
                windowInfos: this.windowInfoStore.getData(),
                prerequisites: this.prerequisiteStore.getData(),
            },
        };

        const r = await this.tauriCommandService.invokeCommand<boolean, SaveInstallerConfig>(
            ProjectManagerCommands.SAVE_INSTALLER_CONFIG_COMMAND,
            data,
        );

        if (!r) {
            return false;
        }

        this.projectStore.updateValues({
            isDirty: false,
        });

        return true;
    }

    //========== resources ============

    async getResourceFiles() {
        const resources = await this.tauriCommandService.invokeCommand<FolderNode[], object>(
            ProjectManagerCommands.READ_SUBFOLDERS_COMMAND,
            {
                path: this.projectStore.resourceDir(),
            },
        );

        if (resources) {
            this.resourceFiletore.setList([]);
            const folders = signal<FolderNode[]>([
                {
                    id: 'resources',
                    name: 'Resources',
                    expanded: false,
                    children: resources,
                },
            ]);

            await this.traverseFolders(folders());
        }
    }

    //========== prerequisites ============

    async getPrerequisites() {
        const prerequissites = await this.tauriCommandService.invokeCommand<
            Prerequisite[],
            undefined
        >(ProjectManagerCommands.GET_PREREQUISITES_COMMAND, undefined);
        return prerequissites;
    }

    //========== registry ============

    //========== private ============

    private async loadInstallerDocumentConfig(filePath: string) {
        const r = await this.tauriCommandService.invokeCommand<InstallerConfig, object>(
            ProjectManagerCommands.LOAD_INSTALLER_DOCUMENT_CONFIG_COMMAND,
            { filePath: filePath },
        );
        return r;
    }

    private async traverseFolders(nodes: FolderNode[]): Promise<void> {
        for (const node of nodes) {
            const list = await this.getFilesInFolder(node.id);

            this.resourceFiletore.addList(list);

            if (node.children?.length) {
                await this.traverseFolders(node.children);
            }
        }
    }

    private async getFilesInFolder(folder: string): Promise<FileItem[]> {
        const files = await this.tauriCommandService.invokeCommand<FileItem[], object>(
            ProjectManagerCommands.READ_FILES_IN_FOLDER_COMMAND,
            {
                path: `${this.projectStore.projectDir()}/${folder}`,
            },
        );

        if (!files) {
            return [];
        }
        return files;
    }
}
