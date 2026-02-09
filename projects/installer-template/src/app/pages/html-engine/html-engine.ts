import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, ProjectFolders, WindowInfoStore } from 'data-access';
import { HtmlPage } from '../../core/models/html-page';
import { ProjectStore } from '../../core/store/project-store';
import { LoadHtmlPage } from '../../core/models/load-html-pages';
import { Progress } from '../../core/models/progress';
import { InstallerService } from '../../core/services/installer-service';
import { Events as EventSystemConsts } from '../../core/consts/event.const';
import { HtmlEngineCommands, TauriCommandService, TauriEventService } from 'tauri';
import { ToastService } from 'service';
import { ApiContracts } from 'api-contracts';

@Component({
    selector: 'app-html-engine',
    imports: [],
    templateUrl: './html-engine.html',
    styleUrl: './html-engine.css',
})
export class HtmlEngine {
    @ViewChild('viewer') iframe!: ElementRef<HTMLIFrameElement>;

    // htmlPages: HtmlPage[] = [];
    index = 0;
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

    private intervalId: any;

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private installerService: InstallerService,
        private tauriEventService: TauriEventService,
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

        console.log(this.windowInfoStore.installerWindow().width);
        console.log(this.windowInfoStore.installerWindow().height);
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
        this.loadPage(pages[0].name, 'firstInstall');
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
        // this.loadPage();
    }

    async loadPages() {
        await Promise.all([this.loadFirstInstallPages(), this.loadMaintenancePages()]);
    }

    /* ================ api implements ================= */

    loadPage(pageName: string, type: 'firstInstall' | 'maintenance') {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            ApiContracts.injectAPIs(
                this.iframe,
                this.navigateTo.bind(this),

                this.install.bind(this),
                this.finishInstall.bind(this),

                this.uninstall.bind(this),
                this.finishUnintall.bind(this),

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

    navigateTo(pageName: string, type: 'firstInstall' | 'maintenance') {
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

    async finishInstall() {}

    async uninstall() {}

    async finishUnintall() {}

    /* ================================= */

    ngOnDestroy() {
        this.progress.set(0);
        if (this.unlisten) {
            this.unlisten();
        }
        // clearInterval(this.intervalId);
    }
}
