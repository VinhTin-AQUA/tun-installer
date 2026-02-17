import { Component, Input, Output, EventEmitter, model, ModelSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField, FormCheckboxControl } from '@angular/forms/signals';
import { FieldTree } from '@angular/forms/signals';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-check-box',
    imports: [CommonModule, TranslatePipe, FormField],
    templateUrl: './check-box.html',
    styleUrl: './check-box.css',
})
export class CheckBox {
    checked: ModelSignal<boolean> = model(false);

    @Input() formField?: FieldTree<boolean>;
    @Input() label = '';
    @Input() disabled = false;

    @Output() valueChange = new EventEmitter<boolean>();

    onInputChange(event: Event) {
        const value = (event.target as HTMLInputElement).checked;
        this.valueChange.emit(value);
    }
}
