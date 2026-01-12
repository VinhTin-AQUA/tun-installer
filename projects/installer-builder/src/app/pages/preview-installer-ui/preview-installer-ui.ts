import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { InstallerPropertyStore } from 'installer-core';
import { HtmlPage } from '../../core/models/html-page';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { Commands } from '../../core/enums/commands';

@Component({
    selector: 'app-preview-installer-ui',
    imports: [],
    templateUrl: './preview-installer-ui.html',
    styleUrl: './preview-installer-ui.css',
})
export class PreviewInstallerUi {
    @ViewChild('viewer', { static: true })
    iframe!: ElementRef<HTMLIFrameElement>;
    htmlPages: HtmlPage[] = [];
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

    constructor(private tauriCommandService: TauriCommandService) {}

    async ngOnInit() {
        this.installerPropertyStore.update({
            productName: 'MyApp',
            productVersion: '1.0.1',
        });

        await this.loadPages();
    }

    ngAfterViewInit() {}

    async loadPages() {
        const pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            Commands.LOAD_HTML_PAGES_COMMAND,
            {}
        );

        if (!pages) {
            return;
        }

        for (let page of pages) {
            page.content = this.propDataBindind(page.content);
        }

        this.htmlPages = pages;
        this.loadPage();
    }

    loadPage() {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            this.injectAppApi();
        };

        iframeEl.srcdoc = this.htmlPages[this.index].content;
    }

    injectAppApi() {
        const win = this.iframe.nativeElement.contentWindow!;
        win.App = {
            next: () => this.next(),
            prev: () => this.prev(),

            save: async (data: any) => {
                console.log(data);
                this.installerPropertyStore.update(data);
            },
            logData: () => {
                console.log(this.installerPropertyStore.getData());
            },
        };
    }

    next() {
        this.index = Math.min(this.index + 1, this.htmlPages.length - 1);
        this.loadPage();
    }

    prev() {
        this.index = Math.max(this.index - 1, 0);
        this.loadPage();
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
            'g'
        );

        return text.replace(pattern, (match) => replacements[match]);
    }
}
