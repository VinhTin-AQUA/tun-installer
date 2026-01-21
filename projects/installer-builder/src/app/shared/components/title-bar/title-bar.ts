import { Component, inject } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ClickOutside } from '../../directives/click-outside';
import { InstallerPropertyStore } from 'installer-core';
import { DialogStore } from '../../../core/stores/dialog.store';
import { FileHelper } from '../../helpers/file.helper';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';

@Component({
    selector: 'app-title-bar',
    imports: [ClickOutside],
    templateUrl: './title-bar.html',
    styleUrl: './title-bar.css',
})
export class TitleBar {
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
