import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-select',
    imports: [TranslatePipe, FormField],
    templateUrl: './select.html',
    styleUrl: './select.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => Select),
            multi: true,
        },
    ],
})
export class Select implements ControlValueAccessor {
    @Input() formField?: FieldTree<string>;
    @Input() name!: string;
    @Input() label: string = '';
    @Input() description: string = '';
    @Input() value!: string;
    @Input() disabled: boolean = false;

    @Input() options: any[] = [];
    @Input() optionLabel: string = 'label';
    @Input() optionValue: string = 'value';

    @Output() valueChange = new EventEmitter<string>();

    // ControlValueAccessor methods
    onChange = (value: any) => {};
    onTouched = () => {};

    writeValue(value: any): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    handleChange(event: Event) {
        const selectedValue = (event.target as HTMLSelectElement).value;
        this.value = selectedValue;

        if (this.formField) {
            this.formField()!.setControlValue(selectedValue);
        }

        this.onChange(selectedValue);
        this.onTouched();
        this.valueChange.emit(selectedValue);
    }
}
