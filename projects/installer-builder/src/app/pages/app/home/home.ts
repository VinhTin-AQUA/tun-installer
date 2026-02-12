import { Component, inject } from '@angular/core';
import { InstallerPropertyStore } from 'data-access';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Router, RouterLink } from '@angular/router';
import { AppRoutes, MainRoutes } from '../../../core/enums/routes.enum';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';
import { DialogStore } from '../../../core/stores/dialog.store';
import { FileHelper } from '../../../shared/helpers/file.helper';

@Component({
    selector: 'app-home',
    imports: [RouterLink],
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

    //routes
    settingRoute = `/${AppRoutes.App}/${AppRoutes.Settings}`;

    constructor(
        private projectManagerService: ProjectManagerService,
        private projectSateService: ProjectStateService,
        private router: Router,
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
        this.router.navigateByUrl(`${MainRoutes.Main}/${MainRoutes.ProductDetails}`);
    }

    openCreateNewProject() {
        this.openMenu = null;
        this.dialogStore.update({ createNewProjectDialog: true });
    }
}
