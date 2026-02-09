import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore, PageType, WindowInfoStore } from 'data-access';
import { HtmlPage } from '../../core/models/html-page';
import { TauriCommandService } from '../../core/tauri/tauri-command-service';
import { HtmlEngineCommands } from '../../core/enums/commands';
import { ProjectStore } from '../../core/stores/project-store';
import { LoadHtmlPage } from '../../core/models/tauri-payloads/load-html-pages';
import { ApiReferences } from '../../core/api-references/api-references';
import { ToastService } from '../../core/services/toast-service';
import { ActivatedRoute } from '@angular/router';

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
        // page_type = 'firstInstall';
        // page_type = 'maintenance';

        this.activatedRoute.queryParams.subscribe((res: any) => {
            console.log(res);
            this.pageType = res.pageType;
        });
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

        if (this.pageType === 'firstInstall') {
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

        if (this.pageType === 'maintenance') {
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
            ApiReferences.injectAPIs(
                this.iframe,
                this.navigateTo.bind(this),
                this.install.bind(this),
                this.uninstall.bind(this),
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

    navigateTo(pageName: string, type: 'firstInstall' | 'maintenance') {
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
            ApiReferences.updateIframe(this.data);
        }, 500);
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
            ApiReferences.updateIframe(this.data);
        }, 500);
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

    private propDataBindind(text: string): string {
        const replacements: Record<string, string> = {
            '{{installationLocation}}': this.data.installationLocation,
            '{{productName}}': this.data.productName,
            '{{icon}}': this.data.icon,
            '{{productVersion}}': this.data.productVersion,
            '{{publisher}}': this.data.publisher,
            '{{supportLink}}': this.data.supportLink,
            '{{supportEmail}}': this.data.supportEmail,
            '{{comment}}': this.data.comment,
            '{{launchFile}}': this.data.launchFile,
            '{{runAsAdmin}}': this.data.runAsAdmin ? 'true' : 'false',
            '{{launchApp}}': this.data.launchApp ? 'true' : 'false',
            '{{progress}}': this.data.progress.toString(),
        };

        const pattern = new RegExp(
            Object.keys(replacements)
                .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex
                .join('|'),
            'g',
        );

        return text.replace(pattern, (match) => replacements[match]);
    }

    ngOnDestroy() {
        this.progress.set(0);
        clearInterval(this.intervalId);
    }
}
