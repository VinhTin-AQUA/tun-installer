import { Component } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ClickOutside } from '../../directives/click-outside';

@Component({
    selector: 'app-title-bar',
    imports: [ClickOutside],
    templateUrl: './title-bar.html',
    styleUrl: './title-bar.css',
})
export class TitleBar {
    private appWindow = getCurrentWindow();

    currentFile: string | null = null;
    isDirty = false;
    openMenu: 'file' | 'edit' | 'view' | null = null;

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

    toggleMenu(menu: 'file' | 'edit' | 'view') {
        this.openMenu = this.openMenu === menu ? null : menu;
    }
}
