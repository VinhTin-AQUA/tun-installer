import { Component, signal } from '@angular/core';
import { TauriEventService } from '../../core/tauri/tauri-event-service';
import { TauriCommandService } from '../../core/tauri/tauri-command-service';
import { CompressCommands } from '../../core/enums/commands';
import { Progress } from '../../core/models/progress';

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
                console.log(event.payload);
                const progress = event.payload;

                this.progress.set(Math.round(progress.percent * 100) / 100);
                this.logs.update((x) => {
                    return [...x, progress.message];
                });
            },
        );

        await this.tauriCommandService.invokeCommand<boolean>(
            CompressCommands.COMPRESS_INSTALLER_COMMAND,
            {},
        );

        this.logs.update((x) => {
            return [...x, 'Done !!'];
        });
    }

    async stopBuild() {
        console.log(123);

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
