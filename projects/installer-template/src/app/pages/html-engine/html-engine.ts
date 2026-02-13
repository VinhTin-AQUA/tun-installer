import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, PageType, ProjectFolders, WindowInfoStore } from 'data-access';
import { HtmlPage } from '../../core/models/html-page';
import { ProjectStore } from '../../core/store/project-store';
import { LoadHtmlPage } from '../../core/models/load-html-pages';
import { Progress } from '../../core/models/progress';
import { InstallerService } from '../../core/services/installer-service';
import { Events as EventSystemConsts } from '../../core/consts/event.const';
import { HtmlEngineCommands, TauriCommandService, TauriEventService } from 'service';
import { ToastService, WindowService } from 'service';
import { ApiContracts } from 'api-contracts';
import { InstallerArgsService } from '../../core/services/installer-args-service';
import { InstallerArgs, InstallerStatus } from '../../core/models/installer-args';
import { UninstallerService } from '../../core/services/uninstaller-service';

@Component({
    selector: 'app-html-engine',
    imports: [],
    templateUrl: './html-engine.html',
    styleUrl: './html-engine.css',
})
export class HtmlEngine {
    @ViewChild('viewer') iframe!: ElementRef<HTMLIFrameElement>;

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
        message: '',
    };
    firstInstallPages = signal<HtmlPage[]>([]);
    maintenancePages = signal<HtmlPage[]>([]);

    projectStore = inject(ProjectStore);
    unlisten: any;
    installerArgs: InstallerArgs = { status: InstallerStatus.Install };
    width = signal<number>(800);
    height = signal<number>(600);

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private installerService: InstallerService,
        private tauriEventService: TauriEventService,
        private windowService: WindowService,
        private installerArgsService: InstallerArgsService,
        private uninstallerService: UninstallerService,
    ) {
        effect(() => {
            const progress = this.progress();

            this.data.progress = progress;
        });
    }

    async ngOnInit() {
        // this.installerPropertyStore.update({
        //     productName: 'MyApp',
        //     productVersion: '1.0.1',
        // });

        const installerArgs = await this.installerArgsService.getInstallerArgs();

        if (installerArgs) {
            this.installerArgs = installerArgs;

            if (installerArgs.status === InstallerStatus.Install) {
                this.width.set(this.windowInfoStore.installerWindow().width);
                this.height.set(this.windowInfoStore.installerWindow().height);
            } else {
                this.width.set(this.windowInfoStore.uninstallerWindow().width);
                this.height.set(this.windowInfoStore.uninstallerWindow().height);
            }
        }
    }

    async ngAfterViewInit() {
        await this.loadPages();
    }

    private async loadFirstInstallPages() {
        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectStore.projectDir() };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[], LoadHtmlPage>(
            HtmlEngineCommands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
            loadHtmlPage,
        );

        if (!pages) {
            return;
        }

        this.firstInstallPages.set(pages);

        if (this.installerArgs.status === InstallerStatus.Install) {
            this.loadPage(this.windowInfoStore.installerWindow().startPage, 'firstInstall');
        }
    }

    private async loadMaintenancePages() {
        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectStore.projectDir() };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[], LoadHtmlPage>(
            HtmlEngineCommands.LOAD_HTML_MAINTENANCE_PAGES_COMMAND,
            loadHtmlPage,
        );

        if (!pages) {
            return;
        }

        this.maintenancePages.set(pages);
        if (this.installerArgs.status === InstallerStatus.Uninstall) {
            this.loadPage(this.windowInfoStore.uninstallerWindow().startPage, 'maintenance');
        }
    }

    async loadPages() {
        await Promise.all([this.loadFirstInstallPages(), this.loadMaintenancePages()]);
    }

    /* ================ api implements ================= */

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

    navigateTo(pageName: string, type: PageType) {
        this.loadPage(pageName, type);
    }

    async install(afterInstallPage: string | null) {
        this.unlisten = await this.tauriEventService.listenEvent<Progress>(
            EventSystemConsts.install,
            (event) => {
                // console.log(event.payload);
                const progress = event.payload;

                this.progress.set(Math.round(progress.percent * 100) / 100);
                this.data.message = progress.message;
                // this.logs.update((x) => {
                //     return [...x, progress.message];
                // });

                ApiContracts.updateIframe(this.data);
            },
        );

        const r = await this.installerService.install([
            ProjectFolders.resources,
            ProjectFolders.prerequisites,
        ]);

        if (afterInstallPage) {
            this.navigateTo(afterInstallPage, 'firstInstall');
        }
    }

    async finishInstall(launchAppNow: boolean) {
        if (launchAppNow) {
            await this.installerService.launchAppNow();
        }
        await this.windowService.closeCurrentWindow();
    }

    async uninstall(afterUninstallPage: string | null) {
        this.unlisten = await this.tauriEventService.listenEvent<Progress>(
            EventSystemConsts.install,
            (event) => {
                // console.log(event.payload);
                const progress = event.payload;

                this.progress.set(Math.round(progress.percent * 100) / 100);
                this.data.message = progress.message;
                // this.logs.update((x) => {
                //     return [...x, progress.message];
                // });

                ApiContracts.updateIframe(this.data);
            },
        );

        const r = await this.uninstallerService.uninstall();

        if (afterUninstallPage) {
            this.navigateTo(afterUninstallPage, 'maintenance');
        }
    }

    async finishUninstall() {
        await this.windowService.closeCurrentWindow();
    }

    /* ================================= */

    ngOnDestroy() {
        this.progress.set(0);
        if (this.unlisten) {
            this.unlisten();
        }
        // clearInterval(this.intervalId);
    }
}
