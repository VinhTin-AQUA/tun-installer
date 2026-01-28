export interface ToastModel {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
    closing?: boolean;
}
