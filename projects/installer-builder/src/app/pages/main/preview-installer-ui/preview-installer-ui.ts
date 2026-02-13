import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, PageType, WindowInfoStore } from 'data-access';
import { HtmlPage } from '../../../core/models/html-page';
import { ProjectStore } from '../../../core/stores/project-store';
import { LoadHtmlPage } from '../../../core/models/tauri-payloads/load-html-pages';
import { ApiContracts } from 'api-contracts';
import { ToastService, WindowService } from 'service';
import { ActivatedRoute } from '@angular/router';
import { HtmlEngineCommands, TauriCommandService } from 'service';
import { ProjectStateService } from '../../../core/services/project-state-service';
import { ProjectManagerService } from '../../../core/services/project-manager-service';

@Component({
    selector: 'app-preview-installer-ui',
    imports: [],
    templateUrl: './preview-installer-ui.html',
    styleUrl: './preview-installer-ui.css',
})
export class PreviewInstallerUi {
    @ViewChild('viewer') iframe!: ElementRef<HTMLIFrameElement>;

    // htmlPages: HtmlPage[] = [];
    // index = 0;
    installerPropertyStore = inject(InstallerPropertyStore);
    windowInfoStore = inject(WindowInfoStore);

    progress = signal<number>(0);

    data = {
        installationLocation: this.installerPropertyStore.installationLocation(),
        productName: this.installerPropertyStore.productName(),
        icon: this.installerPropertyStore.icon(),
        productVersion: this.installerPropertyStore.productVersion(),
        publisher: this.installerPropertyStore.publisher(),
        supportLink: this.installerPropertyStore.supportLink(),
        supportEmail: this.installerPropertyStore.supportEmail(),
        comment: this.installerPropertyStore.comment(),
        launchFile: this.installerPropertyStore.launchFile(),
        runAsAdmin: this.installerPropertyStore.runAsAdmin(),
        launchApp: this.installerPropertyStore.launchApp(),
        progress: this.progress(),
    };
    firstInstallPages = signal<HtmlPage[]>([]);
    maintenancePages = signal<HtmlPage[]>([]);
    iframeWidth = signal<number>(800);
    iframeHeight = signal<number>(600);
    projectStore = inject(ProjectStore);
    pageType: PageType = 'firstInstall';

    // test

    private intervalId: any;

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private activatedRoute: ActivatedRoute,
        private windowService: WindowService,
        private projectStateService: ProjectStateService,
        private projectManagerService: ProjectManagerService,
    ) {
        effect(() => {
            const progress = this.progress();

            this.data.progress = progress;
        });
    }

    async ngOnInit() {
        this.activatedRoute.queryParams.subscribe(async (res: any) => {
            this.pageType = res.pageType;

            await this.init();
            await this.loadPages();
        });

        await this.init();
    }

    private async init() {
        await this.projectStateService.getProjectState();
        await this.projectManagerService.init();
    }

    private async loadFirstInstallPages() {
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[], undefined>(
            HtmlEngineCommands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
            undefined,
        );

        if (!pages) {
            return;
        }

        this.firstInstallPages.set(pages);
        if (this.pageType === 'firstInstall') {
            this.loadPage(this.windowInfoStore.installerWindow().startPage, 'firstInstall');
        }
    }

    private async loadMaintenancePages() {
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[], undefined>(
            HtmlEngineCommands.LOAD_HTML_MAINTENANCE_PAGES_COMMAND,
            undefined,
        );

        if (!pages) {
            return;
        }

        this.maintenancePages.set(pages);

        if (this.pageType === 'maintenance') {
            this.loadPage(this.windowInfoStore.uninstallerWindow().startPage, 'maintenance');
        }
    }

    async loadPages() {
        await Promise.all([this.loadFirstInstallPages(), this.loadMaintenancePages()]);
    }

    loadPage(pageName: string, type: PageType) {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            ApiContracts.injectAPIs(
                this.iframe,
                {
                    navigateTo: this.navigateTo.bind(this),
                    install: this.install.bind(this),
                    finishInstall: this.finishInstall.bind(this),
                    uninstall: this.uninstall.bind(this),
                    finishUninstall: this.finishUninstall.bind(this),
                },

                this.data,
            );
        };

        let page = null;
        switch (type) {
            case 'firstInstall':
                page = this.firstInstallPages().find((x) => x.name === pageName);
                break;
            case 'maintenance':
                page = this.maintenancePages().find((x) => x.name === pageName);
                break;
        }
        if (!page) {
            alert('no page found');
            return;
        }

        // iframeEl.srcdoc = this.propDataBindind(page.content);
        iframeEl.srcdoc = page.content;
    }

    /* ================ api implements ================= */

    navigateTo(pageName: string, type: PageType) {
        this.loadPage(pageName, type);
    }

    async install(afterInstallPage: string | null) {
        this.intervalId = setInterval(() => {
            this.progress.update((x) => x + 5);
            if (this.progress() > 100) {
                this.progress.set(100);
                clearInterval(this.intervalId);

                if (afterInstallPage) {
                    this.navigateTo(afterInstallPage, 'firstInstall');
                }
            }
            ApiContracts.updateIframe(this.data);
        }, 500);
    }

    async finishInstall(launchAppNow: boolean) {
        if (launchAppNow) {
            alert('Lauch APP');
        }
        await this.windowService.closeCurrentWindow();
    }

    async uninstall(afterUninstallPage: string | null) {
        this.intervalId = setInterval(() => {
            this.progress.update((x) => x + 5);
            if (this.progress() > 100) {
                this.progress.set(100);
                clearInterval(this.intervalId);

                if (afterUninstallPage) {
                    this.navigateTo(afterUninstallPage, 'maintenance');
                }
            }
            ApiContracts.updateIframe(this.data);
        }, 500);
    }

    async finishUninstall() {
        await this.windowService.closeCurrentWindow();
    }

    /* ================================= */

    async preview() {
        await this.tauriCommandService.invokeCommand(
            HtmlEngineCommands.PREVIEW_INSTALLER_UI_COMMAND,
            {
                width: this.iframeWidth() + 72,
                height: this.iframeHeight() + 54,
            },
        );
    }

    updateFrameWidth(event: any) {
        const value =
            event.target.value < 600 ? 600 : event.target.value > 800 ? 800 : event.target.value;

        this.iframeWidth.set(Number(value));
    }

    updateFrameHeight(event: any) {
        const value =
            event.target.value < 420 ? 420 : event.target.value > 600 ? 600 : event.target.value;

        this.iframeHeight.set(Number(value));
    }

    reset() {
        this.loadPages();
        this.ngOnDestroy();
    }

    ngOnDestroy() {
        this.progress.set(0);
        clearInterval(this.intervalId);
    }
}
