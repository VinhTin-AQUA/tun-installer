import { Component } from '@angular/core';
import { ToastService } from 'service';

@Component({
    selector: 'app-toast',
    imports: [],
    templateUrl: './toast.html',
    styleUrl: './toast.css',
})
export class Toast {
    constructor(public toastService: ToastService) {}
}
