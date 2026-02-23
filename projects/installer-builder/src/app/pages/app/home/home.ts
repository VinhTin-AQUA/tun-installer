import { Component, inject } from '@angular/core';
import { InstallerPropertyStore } from 'data-access';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Router, RouterLink } from '@angular/router';
import { AppRoutes, MainRoutes } from '../../../core/enums/routes.enum';
import { DialogStore } from '../../../core/stores/dialog.store';
import { open } from '@tauri-apps/plugin-shell';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectFacade } from '../../../core/facades/project-facade';

@Component({
    selector: 'app-home',
    imports: [RouterLink, TranslatePipe],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    appName = 'Tun Installer';
    private appWindow = getCurrentWindow();

    currentFile: string | null = null;
    isDirty = false;
    openMenu: 'file' | 'edit' | 'view' | null = null;

    installerPropertyStore = inject(InstallerPropertyStore);
    dialogStore = inject(DialogStore);
    projectStore = inject(ProjectStore);

    //routes
    settingRoute = `/${AppRoutes.App}/${AppRoutes.Settings}`;

    constructor(
        private router: Router,
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

    toggleMenu(menu: 'file' | 'edit' | 'view', event: Event) {
        event.stopPropagation();
        this.openMenu = this.openMenu === menu ? null : menu;
    }

    async openProject() {
        this.openMenu = null;
        await this.projectFacade.openProject();
        this.router.navigateByUrl(`${MainRoutes.Main}/${MainRoutes.ProductDetails}`);
    }

    openCreateNewProject() {
        this.openMenu = null;
        this.dialogStore.update({ createNewProjectDialog: true });
    }

    async openDocument() {
        await open('https://github.com/VinhTin-AQUA/tun-installer');
    }
}
