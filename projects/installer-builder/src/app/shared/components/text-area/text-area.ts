import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-text-area',
    imports: [FormField, TranslatePipe],
    templateUrl: './text-area.html',
    styleUrl: './text-area.css',
})
export class TextArea {
    // ====== Inputs ======

    @Input() formField?: FieldTree<string>;
    @Input() label = '';
    @Input() value = '';
    @Input() placeholder = '';
    @Input() disabled = false;
    @Input() readonly = false;

    @Output() valueChange = new EventEmitter<string>();

    // ====== Outputs ======
    onInputChange(event: Event) {
        const newValue = (event.target as HTMLInputElement).value;

        if (this.formField) {
            this.formField()!.setControlValue(newValue);
        }

        this.valueChange.emit(newValue);
    }
}
