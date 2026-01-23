import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { InstallerPropertyStore } from 'installer-core';
import { HtmlPage } from '../../core/models/html-page';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { HtmlEngineCommands } from '../../core/enums/commands';
import { ProjectStore } from '../../core/stores/project-store';
import { LoadHtmlPage } from '../../core/models/tauri-payloads/load-html-pages';
import { ApiReferences } from '../../core/api-references/api-references';

@Component({
    selector: 'app-preview-installer-ui',
    imports: [],
    templateUrl: './preview-installer-ui.html',
    styleUrl: './preview-installer-ui.css',
})
export class PreviewInstallerUi {
    @ViewChild('viewer', { static: true }) iframe!: ElementRef<HTMLIFrameElement>;
    htmlPages: HtmlPage[] = [];
    index = 0;

    installerPropertyStore = inject(InstallerPropertyStore);
    projectStore = inject(ProjectStore);

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
        progress: signal<number>(0),
    };

    firstInstallPages = signal<HtmlPage[]>([]);
    maintenancePages = signal<HtmlPage[]>([]);

    constructor(private tauriCommandService: TauriCommandService) {}

    async ngOnInit() {
        // await this.loadPages();
    }

    async ngAfterViewInit() {
        await this.loadPages();
    }

    async loadPages() {
        await Promise.all([this.loadFirstInstallPages(), this.loadMaintenancePages()]);
    }

    private async loadFirstInstallPages() {
        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectStore.projectDir() };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            HtmlEngineCommands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
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
        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectStore.projectDir() };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            HtmlEngineCommands.LOAD_HTML_MAINTENANCE_PAGES_COMMAND,
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

    // async loadPages() {
    //     const pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
    //         HtmlEngineCommands.LOAD_HTML_FIRST_TIME_INSTALL_PAGES_COMMAND,
    //         {
    //             projectDir: this.projectStore.projectDir()
    //         }
    //     );

    //     if (!pages) {
    //         return;
    //     }

    //     for (let page of pages) {
    //         page.content = this.propDataBindind(page.content);
    //     }

    //     this.htmlPages = pages;
    //     this.loadPage();
    // }

    loadPage(pageName: string, type: 'firstInstall' | 'maintenance') {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            ApiReferences.injectAPIs(
                this.iframe,
                this.navigateTo.bind(this),
                this.install.bind(this),
                this.data
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

        iframeEl.srcdoc = page.content;
    }

    /* ================ api implements ================= */

    navigateTo(pageName: string, type: 'firstInstall' | 'maintenance') {
        this.index = Math.min(this.index + 1, this.firstInstallPages.length - 1);
        this.loadPage(pageName, type);
    }

    async install() {}

    /* ================================= */

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
             '{{progress}}': this.data.progress().toString(),
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
