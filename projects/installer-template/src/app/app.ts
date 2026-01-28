import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallerDocumentService } from './core/services/installer-document-service';
import { ProjectStateService } from './core/services/project-state-service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-template');
    isLoading = signal(true);

    constructor(
        private installerDocumentService: InstallerDocumentService,
        private projectStateService: ProjectStateService,
    ) {}

    async ngOnInit() {
        try {
            await this.projectStateService.getProjectState();
            await this.installerDocumentService.getInstallerDocument();
        } finally {
            this.isLoading.set(false);
        }
    }
}
