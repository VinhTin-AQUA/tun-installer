import { Component, inject } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { InstallerPropertyStore } from 'data-access';
import { DialogStore } from '../../../core/stores/dialog.store';
import { ClickOutside } from '../../directives/click-outside';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectFacade } from '../../../core/facades/project-facade';

type menu = 'file' | 'edit' | 'view' | 'tools' | null;

@Component({
    selector: 'app-main-title-bar',
    imports: [ClickOutside],
    templateUrl: './main-title-bar.html',
    styleUrl: './main-title-bar.css',
})
export class MainTitleBar {
    appName = 'Tun Installer';
    private appWindow = getCurrentWindow();

    currentFile: string | null = null;
    isDirty = false;
    openMenu: menu = null;

    installerPropertyStore = inject(InstallerPropertyStore);
    dialogStore = inject(DialogStore);
    projectStore = inject(ProjectStore);

    constructor(
        private projectFacade: ProjectFacade,
    ) {}

    async minimize() {
        await this.appWindow.minimize();
    }

    async toggleMaximize() {
        const isMaximized = await this.appWindow.isMaximized();
        if (isMaximized) {
            await this.appWindow.unmaximize();
        } else {
            await this.appWindow.maximize();
        }
    }

    async close() {
        await this.appWindow.close();
    }

    openSettings() {
        console.log('Open settings');
    }

    toggleMenu(menu: menu, event: Event) {
        event.stopPropagation();
        this.openMenu = this.openMenu === menu ? null : menu;
    }

    async openProject() {
        this.openMenu = null;
        await this.projectFacade.openProject();
    }

    async saveProject() {
        this.openMenu = null;
        await this.projectFacade.saveInstallerDocument();
    }

    openCreateNewProject() {
        this.openMenu = null;
        this.dialogStore.update({ createNewProjectDialog: true });
    }

    async refresh() {
        this.openMenu = null;
        this.projectFacade.refresh();
    }


}
