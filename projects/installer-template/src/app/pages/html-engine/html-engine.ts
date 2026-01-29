import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, WindowInfoStore } from 'installer-core';
import { HtmlPage } from '../../core/models/html-page';
import { ProjectStore } from '../../core/store/project-store';
import { TauriCommandService } from '../../core/tauri/tauri-command-service';
import { ToastService } from '../../core/services/toast-service';
import { LoadHtmlPage } from '../../core/models/load-html-pages';
import { HtmlEngineCommands } from '../../core/enums/tauri-commands';
import { ApiReferences } from '../../core/api-references/api-references';
import { CompressService } from '../../core/services/compress-service';
import { join } from '@tauri-apps/api/path';
import { ProjectFolders } from '../../core/consts/folder.const';
import { TauriEventService } from '../../core/tauri/tauri-event-service';
import { Progress } from '../../core/models/progress';

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
    };
    firstInstallPages = signal<HtmlPage[]>([]);
    maintenancePages = signal<HtmlPage[]>([]);

    projectStore = inject(ProjectStore);
    unlisten: any;

    private intervalId: any;

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private compressService: CompressService,
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
            ApiReferences.injectAPIs(
                this.iframe,
                this.navigateTo.bind(this),
                this.install.bind(this),
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
        // this.intervalId = setInterval(() => {
        //     this.progress.update((x) => x + 5);
        //     if (this.progress() > 100) {
        //         this.progress.set(100);
        //         clearInterval(this.intervalId);

        //         if (afterInstallPage) {
        //             this.navigateTo(afterInstallPage, 'firstInstall');
        //         }
        //     }
        //     ApiReferences.updateIframe(this.data);
        // }, 500);

        this.unlisten = await this.tauriEventService.listenEvent<Progress>(
            'extract-progress',
            (event) => {
                console.log(event.payload);
                const progress = event.payload;

                this.progress.set(Math.round(progress.percent * 100) / 100);
                // this.logs.update((x) => {
                //     return [...x, progress.message];
                // });


                ApiReferences.updateIframe(this.data);

            },
        );

        const r = await this.compressService.extractResourcesAndPrerequsistes([
            ProjectFolders.resources,
            ProjectFolders.prerequisites,
        ]);
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
