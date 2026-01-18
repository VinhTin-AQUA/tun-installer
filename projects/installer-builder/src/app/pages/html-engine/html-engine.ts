import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { HtmlPage } from '../../core/models/html-page';
import { Commands } from '../../core/enums/commands';
import { InstallerPropertyStore } from 'installer-core';
import { LoadHtmlPage } from '../../core/models/tauri-payloads/load-html-pages';
import { ToastService } from '../../core/services/toast-service';

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

    projectDir = this.installerPropertyStore.projectDir();
    installationLocation = this.installerPropertyStore.installationLocation();
    productName = this.installerPropertyStore.productName();
    icon = this.installerPropertyStore.icon();
    productVersion = this.installerPropertyStore.productVersion();
    publisher = this.installerPropertyStore.publisher();
    supportLink = this.installerPropertyStore.supportLink();
    supportEmail = this.installerPropertyStore.supportEmail();
    comment = this.installerPropertyStore.comment();
    launchFile = this.installerPropertyStore.launchFile();
    runAsAdmin = this.installerPropertyStore.runAsAdmin();
    launchApp = this.installerPropertyStore.launchApp();

    iframeWidth = signal<number>(800);
    iframeHeight = signal<number>(500);

    firstInstallPages = signal<HtmlPage[]>([]);
    maintenancePages = signal<HtmlPage[]>([]);

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService,
    ) {}

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
        if (!this.projectDir) {
            this.toastService.show('Please choose or create new config', 'error');
            return;
        }

        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectDir };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            Commands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
            loadHtmlPage,
        );

        if (!pages) {
            return;
        }

        for (let page of pages) {
            page.content = this.propDataBindind(page.content);
        }

        this.firstInstallPages.set(pages);
        this.loadPage(pages[0].name, 'firstInstall');
    }

    private async loadMaintenancePages() {
        if (!this.projectDir) {
            this.toastService.show('Please choose or create new config', 'error');
            return;
        }

        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectDir };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            Commands.LOAD_HTML_MAINTENANCE_PAGES_COMMAND,
            loadHtmlPage,
        );

        if (!pages) {
            return;
        }

        for (let page of pages) {
            page.content = this.propDataBindind(page.content);
        }

        this.maintenancePages.set(pages);
        // this.loadPage();
    }

    async loadPages() {
        await Promise.all([this.loadFirstInstallPages(), this.loadMaintenancePages()]);
    }

    loadPage(pageName: string, type: 'firstInstall' | 'maintenance') {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            this.injectAppApi();
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

        iframeEl.srcdoc = page.content;
    }

    injectAppApi() {
        const win = this.iframe.nativeElement.contentWindow!;
        win.App = {
            next: (pageName: string, type: 'firstInstall' | 'maintenance') =>
                this.next(pageName, type),
            prev: (pageName: string, type: 'firstInstall' | 'maintenance') =>
                this.prev(pageName, type),

            save: async (data: any) => {
                console.log(data);
                this.installerPropertyStore.update(data);
            },
            logData: () => {
                console.log(this.installerPropertyStore.getData());
            },
        };
    }

    next(pageName: string, type: 'firstInstall' | 'maintenance') {
        this.index = Math.min(this.index + 1, this.firstInstallPages.length - 1);
        this.loadPage(pageName, type);
    }

    prev(pageName: string, type: 'firstInstall' | 'maintenance') {
        this.index = Math.max(this.index - 1, 0);
        this.loadPage(pageName, type);
    }

    async preview() {
        await this.tauriCommandService.invokeCommand(Commands.PREVIEW_INSTALLER_UI_COMMAND, {
            width: 1200,
            height: 700,
        });
    }

    updateFrameWidth(event: any) {
        const value =
            event.target.value < 600 ? 600 : event.target.value > 800 ? 800 : event.target.value;

        this.iframeWidth.set(value);
    }

    updateFrameHeight(event: any) {
        const value =
            event.target.value < 420 ? 420 : event.target.value > 600 ? 600 : event.target.value;

        this.iframeHeight.set(value);
    }

    private propDataBindind(text: string): string {
        const replacements: Record<string, string> = {
            '{{projectDir}}': this.projectDir,
            '{{installationLocation}}': this.installationLocation,
            '{{productName}}': this.productName,
            '{{icon}}': this.icon,
            '{{productVersion}}': this.productVersion,
            '{{publisher}}': this.publisher,
            '{{supportLink}}': this.supportLink,
            '{{supportEmail}}': this.supportEmail,
            '{{comment}}': this.comment,
            '{{launchFile}}': this.launchFile,
            '{{runAsAdmin}}': this.runAsAdmin ? 'true' : 'false',
            '{{launchApp}}': this.launchApp ? 'true' : 'false',
        };

        const pattern = new RegExp(
            Object.keys(replacements)
                .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex
                .join('|'),
            'g',
        );

        return text.replace(pattern, (match) => replacements[match]);
    }
}
