import { Component, inject } from '@angular/core';
import { DialogStore } from '../../stores/dialog.store';
import { CreateNewProjectDialog } from '../create-new-project-dialog/create-new-project-dialog';

@Component({
    selector: 'app-dialogs',
    imports: [CreateNewProjectDialog],
    templateUrl: './dialogs.html',
    styleUrl: './dialogs.css',
})
export class Dialogs {
    dialogStore = inject(DialogStore);
}
