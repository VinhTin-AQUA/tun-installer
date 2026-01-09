import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { HtmlPage } from '../../core/models/html-page';
import { Commands } from '../../core/enums/commands';
import { InstallerPropertyStore } from 'installer-core';

@Component({
    selector: 'app-html-engine',
    imports: [],
    templateUrl: './html-engine.html',
    styleUrl: './html-engine.css',
})
export class HtmlEngine {
    @ViewChild('viewer', { static: true })
    iframe!: ElementRef<HTMLIFrameElement>;
    htmlPages: HtmlPage[] = [];
    index = 0;

    installerPropertyStore = inject(InstallerPropertyStore);

    appDir = this.installerPropertyStore.appDir();
    productName = this.installerPropertyStore.productName();
    icon = this.installerPropertyStore.icon();
    productVersion = this.installerPropertyStore.productVersion();
    publisher = this.installerPropertyStore.publisher();
    supportLink = this.installerPropertyStore.supportLink();
    supportEmail = this.installerPropertyStore.supportEmail();
    comment = this.installerPropertyStore.comment();
    sourceDir = this.installerPropertyStore.sourceDir();
    launchFile = this.installerPropertyStore.launchFile();
    runAsAdmin = this.installerPropertyStore.runAsAdmin();
    launchApp = this.installerPropertyStore.launchApp();

    constructor(private tauriCommandService: TauriCommandService) {}

    async ngOnInit() {
        this.installerPropertyStore.update({
            productName: 'MyApp',
            productVersion: '1.0.1',
        });
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

    ngAfterViewInit() {}

    loadPage() {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            this.injectAppApi();
        };

        console.log(this.htmlPages[this.index].name);
        console.log(this.index);

        iframeEl.srcdoc = this.htmlPages[this.index].content;
    }

    injectAppApi() {
        const win = this.iframe.nativeElement.contentWindow!;
        win.App = {
            next: () => this.next(),
            prev: () => this.prev(),

            save: async (data: any) => {
                // await invoke('save_data', {
                //     data: JSON.stringify(data),
                // });
                alert('Saved!');
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
            '{{appDir}}': this.appDir,
            '{{productName}}': this.productName,
            '{{icon}}': this.icon,
            '{{productVersion}}': this.productVersion,
            '{{publisher}}': this.publisher,
            '{{supportLink}}': this.supportLink,
            '{{supportEmail}}': this.supportEmail,
            '{{comment}}': this.comment,
            '{{sourceDir}}': this.sourceDir,
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
