import { PageType } from "data-access";

export {};

declare global {
    interface Window {
        App: {
            navigateTo: (pageName: string, type: PageType) => void;
            install: (afterInstallPage: string | null) => Promise<void>;
            finishInstall: () => Promise<void>;
            uninstall: (afterUninstallPage: string | null) => Promise<void>;
            finishUnintall: () => Promise<void>;
            logData: () => void;
            data: any;
        };
        initApp: () => void; // send initial data to HTML page
        render: (data: any) => void; // send updated data to HTML page
    }
}
