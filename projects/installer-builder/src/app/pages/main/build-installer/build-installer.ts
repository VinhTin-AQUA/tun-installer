import { Component, signal } from '@angular/core';
import { Progress } from '../../../core/models/progress';
import { ToastService } from 'service';
import { CompressCommands, TauriCommandService, TauriEventService } from 'service';

@Component({
    selector: 'app-build-installer',
    imports: [],
    templateUrl: './build-installer.html',
    styleUrl: './build-installer.css',
})
export class BuildInstaller {
    isBuilding = signal<boolean>(false);
    isCompleted = signal<boolean>(false);
    logs = signal<string[]>([]);
    progress = signal<number>(0);
    outputPath = signal<string>(''); // đường dẫn lưu build
    unlisten: any;

    constructor(
        private tauriEventService: TauriEventService,
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
    ) {}

    ngOnInit() {}

    async startBuild() {
        this.isBuilding.set(true);
        this.isCompleted.set(false);
        this.logs.set([]);
        this.progress.set(0);
        this.outputPath.set('');

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
    }

    async stopBuild() {
        this.toastService.show('Stop', 'warning');

        // this.unlisten();
        await this.tauriCommandService.invokeCommand(CompressCommands.CANCEL_COMPRESS_COMMAND, {});
        console.log(345);

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
