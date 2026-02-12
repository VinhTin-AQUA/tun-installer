import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Prerequisite, PrerequisiteStore } from 'data-access';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ToastService } from 'service';

@Component({
    selector: 'app-prerequisites',
    imports: [FormsModule],
    templateUrl: './prerequisites.html',
    styleUrl: './prerequisites.css',
})
export class Prerequisites {
    prerequisiteStore = inject(PrerequisiteStore);

    newPrerequisite: Prerequisite = {
        name: '',
        runAsAdmin: true,
        installPhase: 'Before',
        size: 0,
    };

    constructor(
        private projectManagerService: ProjectManagerService,
        private toastService: ToastService,
    ) {}

    async ngOnInit() {
        await this.save();
    }

    updateRunAsAdmin(name: string, value: boolean) {
        this.prerequisiteStore.update(name, {
            runAsAdmin: value,
        });
    }

    updatePhase(name: string, phase: 'Before' | 'After') {
        this.prerequisiteStore.update(name, {
            installPhase: phase,
        });
    }

    async save() {

        console.log(this.prerequisiteStore.getData());

        

        const newPrerequisites = await this.projectManagerService.getPrerequisites();
        if (!newPrerequisites) return;

        const current = this.prerequisiteStore.getData();
        const merged = newPrerequisites.map((p) => {
            const old = current.find((c) => c.name === p.name);

            return {
                ...p,
                runAsAdmin: old?.runAsAdmin ?? true,
                installPhase: old?.installPhase ?? 'Before',
            };
        });

        this.prerequisiteStore.setList(merged);
        console.log(this.prerequisiteStore.getData());

        const r = await this.projectManagerService.saveInstallerDocument();
        this.toastService.show(
            r ? 'Save Prerequisite Success' : 'Load Prerequisite Failed',
            r ? 'success' : 'error',
        );
    }
}
