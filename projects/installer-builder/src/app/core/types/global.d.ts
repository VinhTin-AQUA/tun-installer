export {};

declare global {
    interface Window {
        App: {
            next: (pageName: string, type: 'firstInstall' | 'maintenance') => void;
            prev: (pageName: string, type: 'firstInstall' | 'maintenance') => void;
            save: (data: any) => Promise<void>;
            logData: () => void;
        };
    }
}
