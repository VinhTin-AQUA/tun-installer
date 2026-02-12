import { Component, inject } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { InstallerPropertyStore } from 'data-access';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';
import { DialogStore } from '../../../core/stores/dialog.store';
import { ClickOutside } from '../../directives/click-outside';
import { FileHelper } from '../../helpers/file.helper';

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
    openMenu: 'file' | 'edit' | 'view' | null = null;

    installerPropertyStore = inject(InstallerPropertyStore);
    dialogStore = inject(DialogStore);

    constructor(
        private projectManagerService: ProjectManagerService,
        private projectSateService: ProjectStateService,
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

    toggleMenu(menu: 'file' | 'edit' | 'view', event: Event) {
        event.stopPropagation();
        this.openMenu = this.openMenu === menu ? null : menu;
    }

    async openProject() {
        this.openMenu = null;
        const filePath = await FileHelper.selectFile([
            { name: 'Tun Installer', extensions: ['tunins'] },
        ]);

        if (!filePath) {
            return;
        }
        let project = await this.projectManagerService.openProject(filePath);
        if (!project) {
            return;
        }
        await this.projectSateService.updateProjectState(project.projectDir, '');
        await this.projectManagerService.init();
    }

    openCreateNewProject() {
        this.openMenu = null;
        this.dialogStore.update({ createNewProjectDialog: true });
    }
}
