import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { HtmlPage } from '../../../core/models/html-page';
import { InstallerPropertyStore, PageType, WindowInfos, WindowInfoStore } from 'data-access';
import { LoadHtmlPage } from '../../../core/models/tauri-payloads/load-html-pages';
import { ToastService } from 'service';
import { ProjectStore } from '../../../core/stores/project-store';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { HtmlEngineCommands, TauriCommandService } from 'service';
import { ApiContracts } from 'api-contracts';
import { TextInput } from '../../../shared/components/text-input/text-input';
import { CheckBox } from '../../../shared/components/check-box/check-box';
import { Button } from '../../../shared/components/button/button';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

type WindowKey = keyof WindowInfos;

@Component({
    selector: 'app-html-engine',
    imports: [TextInput, CheckBox, Button, CommonModule, TranslatePipe],
    templateUrl: './html-engine.html',
    styleUrl: './html-engine.css',
})
export class HtmlEngine {
    @ViewChild('viewer') iframe!: ElementRef<HTMLIFrameElement>;

    index = 0;
    installerPropertyStore = inject(InstallerPropertyStore);
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
    windowInfoStore = inject(WindowInfoStore);
    projectStore = inject(ProjectStore);

    configSections: {
        id: PageType;
        label: string;
        pages: () => { name: string }[];
    }[] = [
        {
            id: 'firstInstall',
            label: 'First Time Install',
            pages: () => this.firstInstallPages(),
        },
        {
            id: 'maintenance',
            label: 'Maintenance',
            pages: () => this.maintenancePages(),
        },
    ];

    activeSection: PageType | '' = 'firstInstall';
    activePageType = signal<PageType>('firstInstall');

    PAGE_TO_WINDOW_KEY: Record<PageType, WindowKey> = {
        firstInstall: 'installerWindow',
        maintenance: 'uninstallerWindow',
    };

    private get activeWindowKey(): WindowKey {
        return this.PAGE_TO_WINDOW_KEY[this.activePageType()];
    }

    get activeWindow() {
        return this.windowInfoStore[this.activeWindowKey]();
    }

    // test

    private intervalId: any;

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
        private projectManagerService: ProjectManagerService,
    ) {
        effect(() => {
            const progress = this.progress();

            this.data.progress = progress;
        });
    }

    async ngOnInit() {}

    async ngAfterViewInit() {
        await this.loadPages();
    }

    /* ================ others ================= */

    toggleSection(id: PageType) {
        this.activeSection = this.activeSection === id ? '' : id;
    }

    /* ================ load pages ================= */

    private async loadFirstInstallPages() {
        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectStore.projectDir() };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[], LoadHtmlPage>(
            HtmlEngineCommands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
            loadHtmlPage,
        );

        if (!pages || pages.length == 0) {
            return;
        }

        this.firstInstallPages.set(pages);
        this.loadPage(pages[0].name, 'firstInstall');
        this.windowInfoStore.updateWindow('installerWindow', { title: pages[0].name });
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

    loadPage(pageName: string, type: 'firstInstall' | 'maintenance') {
        this.activePageType.set(type);
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
            ApiContracts.updateIframe(this.data);
        }, 500);
    }

    async finishInstall(launchAppNow: boolean) {
        if (launchAppNow) {
            alert('Lauch APP');
        }
        alert('Finish Install');
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
        alert('Finish Uninstall');
    }

    /* ================================= */

    async preview() {
        const width =
            this.activePageType() === 'firstInstall'
                ? this.windowInfoStore.getData().installerWindow.width + 72
                : this.windowInfoStore.getData().uninstallerWindow.width + 54;
        const height =
            this.activePageType() === 'firstInstall'
                ? this.windowInfoStore.getData().installerWindow.height + 72
                : this.windowInfoStore.getData().uninstallerWindow.height + 54;
        await this.tauriCommandService.invokeCommand(
            HtmlEngineCommands.PREVIEW_INSTALLER_UI_COMMAND,
            {
                pageType: this.activePageType(),
                width: width,
                height: height,
            },
        );
    }

    updateFrameWidth(event: any) {
        const value =
            event.target.value < 600 ? 600 : event.target.value > 800 ? 800 : event.target.value;

        this.windowInfoStore.updateWindow(this.activeWindowKey, { width: Number(value) });
    }

    updateFrameHeight(event: any) {
        const value =
            event.target.value < 420 ? 420 : event.target.value > 600 ? 600 : event.target.value;

        this.windowInfoStore.updateWindow(this.activeWindowKey, { height: Number(value) });
    }

    updateWindowTitle(event: any) {
        this.windowInfoStore.updateWindow(this.activeWindowKey, { title: event.target.value });
    }

    updateStartPage(event: any) {
        this.windowInfoStore.updateWindow(this.activeWindowKey, { startPage: event.target.value });
    }

    updateAlwaysOnTop(event: any) {
        const checked = (event.target as HTMLInputElement).checked;

        this.windowInfoStore.updateWindow(this.activeWindowKey, { alwaysOnTop: checked });
    }

    reset() {
        this.loadPages();
        this.ngOnDestroy();
    }

    async save() {
        const r = await this.projectManagerService.saveInstallerDocument();
        if (!r) {
            this.toastService.show('Something error', 'error');
            return;
        }

        this.toastService.show('Save', 'success');
    }

    ngOnDestroy() {
        this.progress.set(0);
        clearInterval(this.intervalId);
    }
}
