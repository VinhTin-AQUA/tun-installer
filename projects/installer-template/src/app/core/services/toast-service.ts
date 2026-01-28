import { Injectable, signal } from '@angular/core';
import { ToastModel } from '../models/toast.model';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    toasts = signal<ToastModel[]>([]);
    private id = 0;

    show(message: string, type: ToastModel['type'] = 'info', duration = 3000) {
        const toast: ToastModel = {
            id: ++this.id,
            message,
            type,
            duration,
        };

        this.toasts.update((x) => {
            return [...x, toast];
        });

        setTimeout(() => this.startClose(toast.id), duration);
    }

    private startClose(id: number) {
        this.remove(id);
    }

    remove(id: number) {
        this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
    }
}
