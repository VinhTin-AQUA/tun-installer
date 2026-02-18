import { Component, Input } from '@angular/core';

export type BadgeStatus = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

@Component({
    selector: 'app-badge',
    imports: [],
    templateUrl: './badge.html',
    styleUrl: './badge.css',
})
export class Badge {
    @Input() status: BadgeStatus = 'primary';
}
