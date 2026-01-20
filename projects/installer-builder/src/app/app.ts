import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language-service';
import { Toast } from './shared/components/toast/toast';
import { FileStateConfigService } from './core/services/file-state-config-service';
import { WorkingConfigFileStore } from './shared/stores/working-config.store';
import { Dialogs } from "./shared/components/dialogs/dialogs";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Toast, Dialogs],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-builder');
    fileStateConfigService = inject(FileStateConfigService);
    workingConfigFileStore = this.fileStateConfigService.workingConfigFileStore;
    isLoading = signal(true);

    constructor(private languageService: LanguageService) {}

    async ngOnInit() {
        try {
            const path = this.workingConfigFileStore.filePath();
            await this.fileStateConfigService.init(path);
        } finally {
            this.isLoading.set(false);
        }
    }
}
