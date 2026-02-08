import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { TauriCommandService } from '../../core/tauri/tauri-command-service';
import { HtmlPage } from '../../core/models/html-page';
import { InstallerPropertyStore, WindowInfoStore } from 'data-access';
import { LoadHtmlPage } from '../../core/models/tauri-payloads/load-html-pages';
import { ToastService } from '../../core/services/toast-service';
import { ProjectStore } from '../../core/stores/project-store';
import { HtmlEngineCommands } from '../../core/enums/commands';
import { ApiReferences } from '../../core/api-references/api-references';
import { ProjectManagerService } from '../../core/services/project-manager-service';

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
    // iframeWidth = signal<number>(800);
    // iframeHeight = signal<number>(600);
    // windowTitle = signal<string>('Window title');
    // startPage = signal<string>('');
    // alwaysOnTop = signal<boolean>(false);

    windowInfoStore = inject(WindowInfoStore);

    projectStore = inject(ProjectStore);

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

        if (!pages || pages.length == 0) {
            return;
        }

        this.firstInstallPages.set(pages);
        this.loadPage(pages[0].name, 'firstInstall');
        this.windowInfoStore.updateValue({ title: pages[0].name });
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

    /* ================================= */

    async preview() {
        await this.tauriCommandService.invokeCommand(
            HtmlEngineCommands.PREVIEW_INSTALLER_UI_COMMAND,
            {
                width: this.windowInfoStore.getData().width + 72,
                height: this.windowInfoStore.getData().height + 54,
            },
        );
    }

    updateFrameWidth(event: any) {
        const value =
            event.target.value < 600 ? 600 : event.target.value > 800 ? 800 : event.target.value;
        this.windowInfoStore.updateValue({ width: Number(value) });
    }

    updateFrameHeight(event: any) {
        const value =
            event.target.value < 420 ? 420 : event.target.value > 600 ? 600 : event.target.value;
        this.windowInfoStore.updateValue({ height: Number(value) });
    }

    updateWindowTitle(event: any) {
        const value = event.target.value;
        this.windowInfoStore.updateValue({ title: value });
    }

    updateStartPage(event: any) {
        const value = event.target.value;
        this.windowInfoStore.updateValue({
            startPage: value,
        });
    }

    updateAlwaysOnTop(event: any) {
        const checked = (event.target as HTMLInputElement).checked;

        console.log(checked); // true / false

        this.windowInfoStore.updateValue({
            alwaysOnTop: checked,
        });
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
