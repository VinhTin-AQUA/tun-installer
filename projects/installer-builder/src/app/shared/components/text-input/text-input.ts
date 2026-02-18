import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { generateRandomId } from '../../helpers/string.helper';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-text-input',
    imports: [FormField, TranslatePipe],
    templateUrl: './text-input.html',
    styleUrl: './text-input.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInput),
            multi: true,
        },
    ],
})
export class TextInput implements ControlValueAccessor {
    // ====== Inputs ======
    @Input() formField?: FieldTree<string>;
    @Input() label = '';
    @Input() value = '';
    @Input() placeholder = '';
    @Input() disabled = false;
    @Input() readonly = false;
    @Input() id = generateRandomId();

    @Output() valueChange = new EventEmitter<string>();

    // ====== ControlValueAccessor ======
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(val: string): void {
        this.value = val ?? '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    // ====== Event ======
    onInputChange(event: Event) {
        const newValue = (event.target as HTMLInputElement).value;
        this.value = newValue;

        if (this.formField) {
            this.formField()!.setControlValue(newValue);
        }

        this.onChange(newValue); // cho ngModel
        this.valueChange.emit(newValue); // giữ backward compatibility
    }

    onBlur() {
        this.onTouched();
    }
}
