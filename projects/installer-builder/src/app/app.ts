import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language-service';
import { Toast } from './shared/components/toast/toast';
import { Dialogs } from './shared/components/dialogs/dialogs';
import { ProjectStateService } from './core/services/project-state-service';
import { ProjectManagerService } from './core/services/project-manager-service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Toast, Dialogs],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-builder');
    isLoading = signal(true);

    constructor(
        private languageService: LanguageService,
        private projectStateService: ProjectStateService,
        private projectManagerService: ProjectManagerService,
    ) {}

    async ngOnInit() {
        await this.init();
    }

    private async init() {
        try {
            await this.projectStateService.getProjectState();
            await this.projectManagerService.init();
        } finally {
            this.isLoading.set(false);
        }
    }
}
