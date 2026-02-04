import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Prerequisite } from 'installer-core';
import { ProjectManagerService } from '../../core/services/project-manager-service';

@Component({
    selector: 'app-prerequisites',
    imports: [FormsModule],
    templateUrl: './prerequisites.html',
    styleUrl: './prerequisites.css',
})
export class Prerequisites {
    prerequisites = signal<Prerequisite[]>([]);

    newPrerequisite: Prerequisite = {
        name: '',
        runAsAdmin: true,
        installPhase: 'before',
        size: 0
    };

    constructor(private projectManagerService: ProjectManagerService) {}

    async ngOnInit() {
        const prerequisites = await this.projectManagerService.getPrerequisites();
        console.log(prerequisites);
        if (!prerequisites) {
            return;
        }
        this.prerequisites.set(prerequisites);
    }

    addPrerequisite() {
        if (!this.newPrerequisite.name.trim()) return;

        this.prerequisites.update((x) => {
            return [...x, this.newPrerequisite];
        });
    }

    removePrerequisite(name: string) {
        this.prerequisites.update((x) => {
            let t = x.filter((x) => x.name !== name);
            return t;
        });
    }

    save() {
        const config = {
            prerequisites: this.prerequisites,
        };

        // giả lập lưu file / gửi API
        console.log('Saved config:', JSON.stringify(config, null, 2));
        alert('Đã lưu cấu hình prerequisite');
    }
}
