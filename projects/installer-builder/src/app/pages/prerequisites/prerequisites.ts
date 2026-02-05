import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Prerequisite, PrerequisiteStore } from 'installer-core';
import { ProjectManagerService } from '../../core/services/project-manager-service';
import { ToastService } from '../../core/services/toast-service';

@Component({
    selector: 'app-prerequisites',
    imports: [FormsModule],
    templateUrl: './prerequisites.html',
    styleUrl: './prerequisites.css',
})
export class Prerequisites {
    // prerequisites = signal<Prerequisite[]>([]);
    prerequisiteStore = inject(PrerequisiteStore);

    newPrerequisite: Prerequisite = {
        name: '',
        runAsAdmin: true,
        installPhase: 'before',
        size: 0,
    };

    constructor(
        private projectManagerService: ProjectManagerService,
        private toastService: ToastService,
    ) {}

    async ngOnInit() {
        await this.save();
    }

    async save() {
        const prerequisites = await this.projectManagerService.getPrerequisites();
        console.log(prerequisites);
        if (!prerequisites) {
            return;
        }
        this.prerequisiteStore.setList(prerequisites);

        const r = await this.projectManagerService.saveInstallerDocument();
        if (r) {
            this.toastService.show('Save Prerequisite Success', 'success');
        } else {
            this.toastService.show('Load Prerequisite Failed', 'error');
        }
    }
}
