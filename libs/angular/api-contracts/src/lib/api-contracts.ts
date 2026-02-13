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
            finishInstall: (launchAppNow: boolean) => Promise<void>;

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
        methods: {
            navigateTo: (pageName: string, type: PageType) => void;

            install: (afterInstallPage: string | null) => Promise<void>;
            finishInstall: (launchAppNow: boolean) => Promise<void>;

            uninstall: (afterUninstallPage: string | null) => Promise<void>;
            finishUninstall: () => Promise<void>;
        },

        data: any,
    ) {
        const win = iframe.nativeElement.contentWindow!;
        this.win = win;

        this.win.App = {
            navigateTo: (pageName: string, type: PageType) => {
                methods.navigateTo(pageName, type);
            },
            install: async (afterInstallPage: string | null) => {
                await methods.install(afterInstallPage);
            },
            finishInstall: async (launchAppNow: boolean) => {
                await methods.finishInstall(launchAppNow);
            },
            uninstall: async (afterUninstallPage: string | null) => {
                await methods.uninstall(afterUninstallPage);
            },
            finishUninstall: async () => {
                await methods.finishUninstall();
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
