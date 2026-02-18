import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Prerequisite, PrerequisiteStore } from 'data-access';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ToastService } from 'service';
import { TranslatePipe } from '@ngx-translate/core';
import { CheckBox } from '../../../shared/components/check-box/check-box';
import { Button } from '../../../shared/components/button/button';
import { Select } from '../../../shared/components/select/select';
import { EPrerequisitePhase, PrerequisitePhaseType } from '../../../core/models/prerequisite-phase';

@Component({
    selector: 'app-prerequisites',
    imports: [FormsModule, TranslatePipe, CheckBox, Button, Select, TranslatePipe],
    templateUrl: './prerequisites.html',
    styleUrl: './prerequisites.css',
})
export class Prerequisites {
    prerequisiteStore = inject(PrerequisiteStore);
    newPrerequisite: Prerequisite = {
        name: '',
        runAsAdmin: true,
        installPhase: EPrerequisitePhase.Before,
        size: 0,
    };

    prerequisitePhaseOptions = [
        {
            label: EPrerequisitePhase.Before,
            value: EPrerequisitePhase.Before,
        },
        {
            label: EPrerequisitePhase.After,
            value: EPrerequisitePhase.After,
        },
    ];

    constructor(
        private projectManagerService: ProjectManagerService,
        private toastService: ToastService,
    ) {}

    async ngOnInit() {
        await this.save();
    }

    updateRunAsAdmin(name: string, value: boolean) {
        console.log(value);

        this.prerequisiteStore.update(name, {
            runAsAdmin: value,
        });
    }

    updatePhase(name: string, phase: PrerequisitePhaseType) {
        this.prerequisiteStore.update(name, {
            installPhase: phase,
        });
    }

    async save() {
        const newPrerequisites = await this.projectManagerService.getPrerequisites();
        if (!newPrerequisites) return;

        const current = this.prerequisiteStore.getData();
        const merged = newPrerequisites.map((p) => {
            const old = current.find((c) => c.name === p.name);

            return {
                ...p,
                runAsAdmin: old?.runAsAdmin ?? true,
                installPhase: old?.installPhase ?? EPrerequisitePhase.Before,
            };
        });

        this.prerequisiteStore.setList(merged);
        const r = await this.projectManagerService.saveInstallerDocument();
        this.toastService.show(
            r ? 'Save Prerequisite Success' : 'Load Prerequisite Failed',
            r ? 'success' : 'error',
        );
    }
}
