import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { generateRandomId } from '../../helpers/string.helper';

@Component({
    selector: 'app-text-input',
    imports: [FormField, TranslatePipe],
    templateUrl: './text-input.html',
    styleUrl: './text-input.css',
})
export class TextInput {
    // ====== Inputs ======

    @Input() formField?: FieldTree<string>;
    @Input() label = '';
    @Input() value = '';
    @Input() placeholder = '';
    @Input() disabled = false;
    @Input() readonly = false;
    @Input() id = generateRandomId();

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
