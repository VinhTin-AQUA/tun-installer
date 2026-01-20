import { Component, inject } from '@angular/core';
import { DialogStore } from '../../stores/dialog.store';

@Component({
    selector: 'app-create-new-project-dialog',
    imports: [],
    templateUrl: './create-new-project-dialog.html',
    styleUrl: './create-new-project-dialog.css',
})
export class CreateNewProjectDialog {
    dialogStore = inject(DialogStore);

    closeDialog() {
        this.dialogStore.update({ createNewProjectDialog: false });
    }
}
