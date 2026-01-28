import { ElementRef } from '@angular/core';

export class ApiReferences {
    private static win: Window;

    public static injectAPIs(
        iframe: ElementRef<HTMLIFrameElement>,
        navigateTo: (pageName: string, type: 'firstInstall' | 'maintenance') => void,
        install: (afterInstallPage: string | null) => Promise<void>,
        data: any,
    ) {
        const win = iframe.nativeElement.contentWindow!;
        this.win = win;

        this.win.App = {
            navigateTo: (pageName: string, type: 'firstInstall' | 'maintenance') => {
                navigateTo(pageName, type);
            },
            install: async (afterInstallPage: string | null) => {
                await install(afterInstallPage);
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
