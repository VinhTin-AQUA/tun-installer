import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, MemorySpaceStore, PageType, WindowInfoStore } from 'data-access';
import { HtmlPage } from '../../../core/models/html-page';
import { ProjectStore } from '../../../core/stores/project-store';
import { LoadHtmlPage } from '../../../core/models/tauri-payloads/load-html-pages';
import { ApiContracts, InstallerData } from 'api-contracts';
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
    memorySpaceStore = inject(MemorySpaceStore);

    progress = signal<number>(0);

    data: InstallerData = {
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
        message: '',
        volumeSpaceAvailable: this.memorySpaceStore.getData().volumeSpaceAvailable,
        volumeSpaceRemaining: this.memorySpaceStore.getData().volumeSpaceRemaining,
        volumeSpaceRequired: this.memorySpaceStore.getData().volumeSpaceRequired,
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
    }

    private async init() {
        await this.projectStateService.getProjectState();
        await this.projectManagerService.init();

        this.data = {
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
            message: '',
            volumeSpaceAvailable: this.memorySpaceStore.getData().volumeSpaceAvailable,
            volumeSpaceRemaining: this.memorySpaceStore.getData().volumeSpaceRemaining,
            volumeSpaceRequired: this.memorySpaceStore.getData().volumeSpaceRequired,
        };
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
        if (this.data.volumeSpaceRemaining < 1024 * 10) {
            this.toastService.show('Out of memory');
            return;
        }

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

    ngOnDestroy() {
        this.progress.set(0);
        clearInterval(this.intervalId);
    }
}
