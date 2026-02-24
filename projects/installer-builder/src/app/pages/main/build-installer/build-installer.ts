import { Component, inject, signal } from '@angular/core';
import { Progress } from '../../../core/models/progress';
import { ToastService } from 'service';
import { CompressCommands, TauriCommandService, TauriEventService } from 'service';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { Button } from '../../../shared/components/button/button';
import { ClickOutside } from '../../../shared/directives/click-outside';
import { TranslatePipe } from '@ngx-translate/core';
import { join } from '@tauri-apps/api/path';
import { ProjectFacade } from '../../../core/facades/project-facade';

@Component({
    selector: 'app-build-installer',
    imports: [Button, ClickOutside, TranslatePipe],
    templateUrl: './build-installer.html',
    styleUrl: './build-installer.css',
})
export class BuildInstaller {
    isBuilding = signal<boolean>(false);
    isCompleted = signal<boolean>(false);
    logs = signal<string[]>([]);
    progress = signal<number>(0);
    outputPath = signal<string>('');
    unlisten: any;
    projectStore = inject(ProjectStore);

    constructor(
        private tauriEventService: TauriEventService,
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private projectManagerService: ProjectManagerService,
        private projectFacade: ProjectFacade
    ) {}

    ngOnInit() {}

    async startBuild() {
        await this.projectFacade.saveInstallerDocument();
        const formValid = this.projectManagerService.validateInstallerPropertyDataForm();

        if (!formValid) {
            return;
        }

        this.isBuilding.set(true);
        this.isCompleted.set(false);
        this.logs.set([]);
        this.progress.set(0);
        const ouputPath = await join(`${this.projectStore.projectDir()}`, 'output');
        this.outputPath.set(ouputPath.replace(/\\/g, '/'));

        this.logs.update((x) => {
            return [...x, '🚀 Build started...'];
        });

        this.unlisten = await this.tauriEventService.listenEvent<Progress>(
            'compress-progress',
            (event) => {
                const progress = event.payload;
                this.progress.set(Math.round(progress.percent * 100) / 100);
                this.logs.update((x) => {
                    return [...x, progress.message];
                });
            },
        );

        await this.tauriCommandService.invokeCommand<boolean, undefined>(
            CompressCommands.COMPRESS_INSTALLER_COMMAND,
            undefined,
        );

        this.toastService.show('Build success fully', 'success');
        this.logs.update((x) => {
            return [...x, 'Done !!'];
        });
        this.isBuilding.set(false);
        this.isCompleted.set(true);
    }

    async stopBuild() {
        this.toastService.show('Stop', 'warning');
        this.unlisten();
        await this.tauriCommandService.invokeCommand(CompressCommands.CANCEL_COMPRESS_COMMAND, {});

        this.logs.update((x) => {
            return [...x, `⛔ Build stopped at ${this.progress}%`];
        });

        this.isBuilding.set(false);
    }

    ngOnDestroy() {
        if (this.unlisten) {
            this.unlisten();
        }
    }
}
