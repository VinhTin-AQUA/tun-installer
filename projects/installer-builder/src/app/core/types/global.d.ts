export {};

declare global {
    interface Window {
        App: {
            navigateTo: (pageName: string, type: 'firstInstall' | 'maintenance') => void;
            install: () => Promise<void>;
            logData: () => void;
            data: any;
        };
        initApp: () => void; // send initial data to HTML page
        render: (data: any) => void; // send updated data to HTML page
    }
}
