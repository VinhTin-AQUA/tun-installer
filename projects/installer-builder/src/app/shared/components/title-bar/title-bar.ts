import { Component, inject } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ClickOutside } from '../../directives/click-outside';
import { FileHelper } from '../../helpers/file.helper';
import { InstallerPropertyStore } from 'installer-core';
import { FileStateConfigService } from '../../../core/services/file-state-config-service';
import { DialogStore } from '../../stores/dialog.store';

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

    /**
     *
     */
    constructor(private fileStateConfigService: FileStateConfigService) {}

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

    async openFile() {
        this.openMenu = null;
        const filePath = await FileHelper.selectFile();
        this.fileStateConfigService.init(filePath);
    }

    openCreateNewProject() {
        this.openMenu = null;
        this.dialogStore.update({ createNewProjectDialog: true });
    }
}
