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

    iframeWidth = signal<number>(800);
    iframeHeight = signal<number>(500);

    constructor(
        private tauriCommandService: TauriCommandService,
        private toastService: ToastService
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

    async loadPages() {
        if (!this.projectDir) {
            this.toastService.show('Please choose or create new config', 'error');
            return;
        }

        const loadHtmlPage: LoadHtmlPage = { projectDir: this.projectDir };
        let pages = await this.tauriCommandService.invokeCommand<HtmlPage[]>(
            Commands.LOAD_HTML_PAGES_COMMAND,
            loadHtmlPage
        );

        if (!pages) {
            pages = [
                {
                    name: 'no-name',
                    content: `
                    <div style="
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    ">
                        <span>No HTML Pages found</span>
                    </div>
                    `,
                },
            ];
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

    async preview() {
        await this.tauriCommandService.invokeCommand(Commands.PREVIEW_INSTALLER_UI_COMMAND, {
            width: 1200,
            height: 700,
        });
    }

    updateFrameWidth(event: any) {
        this.iframeWidth.set(event.target.value);
    }

    updateFrameHeight(event: any) {
        this.iframeHeight.set(event.target.value);
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
