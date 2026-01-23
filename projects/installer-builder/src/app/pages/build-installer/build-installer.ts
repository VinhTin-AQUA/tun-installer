import { Component, signal } from '@angular/core';

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

    private buildInterval: any;
    private step = 0;
    private totalSteps = 10;

    startBuild() {
        this.isBuilding.set(true);
        this.isCompleted.set(false);
        this.logs.set([]);
        this.progress.set(0);
        this.outputPath.set('');
        this.step = 0;

        this.logs.update((x) => {
            return [...x, '🚀 Build started...'];
        });

        this.buildInterval = setInterval(() => {
            this.step++;
            this.progress.set(Math.round((this.step / this.totalSteps) * 100));
            this.logs.update((x) => {
                return [
                    ...x,
                    `⚙️ Building step ${this.step}/${this.totalSteps} (${this.progress}%)`,
                ];
            });

            if (this.step >= this.totalSteps) {
                this.progress.set(100);
                this.completeBuild();
            }
        }, 800);
    }

    completeBuild() {
        this.clearInterval();

        this.isBuilding.set(false);
        this.isCompleted.set(true);
        this.outputPath.set(`/dist/build_${Date.now()}`);

        this.logs.update((x) => {
            return [...x, `✅ Build completed successfully!`];
        });

        this.logs.update((x) => {
            return [...x, `📦 Output saved at: ${this.outputPath}`];
        });
    }

    stopBuild() {
        if (!this.isBuilding) return;

        this.clearInterval();
        this.logs.update((x) => {
            return [...x, `⛔ Build stopped at ${this.progress}%`];
        });

        this.isBuilding.set(false);
    }

    private clearInterval() {
        if (this.buildInterval) {
            clearInterval(this.buildInterval);
            this.buildInterval = null;
        }
    }

    ngOnDestroy() {
        this.clearInterval();
    }
}
