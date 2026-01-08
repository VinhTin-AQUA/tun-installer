import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-html-engine',
    imports: [],
    templateUrl: './html-engine.html',
    styleUrl: './html-engine.css',
})
export class HtmlEngine {
    @ViewChild('viewer', { static: true })
    iframe!: ElementRef<HTMLIFrameElement>;

    pages = ['pages/page1.html', 'pages/page2.html'];

    index = 0;

    ngAfterViewInit() {
        this.loadPage();
    }

    loadPage() {
        const iframeEl = this.iframe.nativeElement;

        iframeEl.onload = () => {
            this.injectAppApi();
        };

        iframeEl.src = this.pages[this.index];
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
        this.index = Math.min(this.index + 1, this.pages.length - 1);
        this.loadPage();
    }

    prev() {
        this.index = Math.max(this.index - 1, 0);
        this.loadPage();
    }
}
