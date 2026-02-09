// import { Component } from '@angular/core';

// @Component({
//   selector: 'lib-api-contracts',
//   imports: [],
//   template: `
//     <p>
//       api-contracts works!
//     </p>
//   `,
//   styles: ``,
// })
// export class ApiContracts {

// }

import { PageType } from 'data-access';

export {};

declare global {
    interface Window {
        App: {
            navigateTo: (pageName: string, type: PageType) => void;

            install: (afterInstallPage: string | null) => Promise<void>;
            finishInstall: () => Promise<void>;

            uninstall: (afterUninstallPage: string | null) => Promise<void>;
            finishUninstall: () => Promise<void>;

            logData: () => void;
            data: any;
        };
        initApp: () => void; // send initial data to HTML page
        render: (data: any) => void; // send updated data to HTML page
    }
}

import { ElementRef } from '@angular/core';

export class ApiContracts {
    private static win: Window;

    public static injectAPIs(
        iframe: ElementRef<HTMLIFrameElement>,
        navigateTo: (pageName: string, type: PageType) => void,

        install: (afterInstallPage: string | null) => Promise<void>,
        finishInstall: () => Promise<void>,

        uninstall: (afterUninstallPage: string | null) => Promise<void>,
        finishUninstall: () => Promise<void>,
        
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
            finishUninstall: async () => {
                await finishUninstall();
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
