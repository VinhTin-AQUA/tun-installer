import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from 'service';

@Component({
    selector: 'app-toast',
    imports: [TranslatePipe],
    templateUrl: './toast.html',
    styleUrl: './toast.css',
})
export class Toast {
    constructor(public toastService: ToastService) {}
}
