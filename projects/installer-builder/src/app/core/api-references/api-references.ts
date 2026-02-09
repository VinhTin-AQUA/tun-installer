import { ElementRef } from '@angular/core';
import { PageType } from 'data-access';

export class ApiReferences {
    private static win: Window;

    public static injectAPIs(
        iframe: ElementRef<HTMLIFrameElement>,
        navigateTo: (pageName: string, type: PageType) => void,
        install: (afterInstallPage: string | null) => Promise<void>,
        finishInstall: () => Promise<void>,
        uninstall: (afterUninstallPage: string | null) => Promise<void>,
        finishUnintall: () => Promise<void>,
        data: any,
    ) {
        const win = iframe.nativeElement.contentWindow!;
        this.win = win;

        this.win.App = {
            navigateTo: (pageName: string, type: PageType) => {
                navigateTo(pageName, type);
            },
            install: async (afterInstallPage: string | null) => {
                await install(afterInstallPage);
            },
            finishInstall: async () => {
                await finishInstall();
            },
            uninstall: async (afterUninstallPage: string | null) => {
                await uninstall(afterUninstallPage);
            },
            finishUnintall: async () => {
                await finishUnintall();
            },
            logData: () => {
                console.log('Test Install');
            },
            data: data,
        };

        this.win.initApp?.();
    }

    public static updateIframe(data: any) {
        this.win?.render?.(data);
    }

    // public static sendData(data: any) {
    //     if(!this.win) {
    //         return;
    //     }
    //     console.log(this.win);

    //     this.win.postMessage(data, '*');
    // }
}
