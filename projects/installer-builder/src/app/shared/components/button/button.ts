import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

@Component({
    selector: 'app-button',
    imports: [CommonModule, TranslatePipe],
    templateUrl: './button.html',
    styleUrl: './button.css',
})
export class Button {
    @Input() formField?: FieldTree<boolean>;
    @Input() label = '';
    @Input() disabled = false;
    @Input() icon?: 'check' | 'trash';
    @Input() variant: ButtonVariant = 'primary';
    @Input() class = '';

    @Output() buttonClick = new EventEmitter<boolean>();

    handleClick(event: Event) {
        if (!this.disabled) {
            this.buttonClick.emit();
        }
    }
}
