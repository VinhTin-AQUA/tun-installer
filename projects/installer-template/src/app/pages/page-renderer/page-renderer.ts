import { Component, effect, inject, Renderer2, signal } from '@angular/core';
import { UIPage } from '../../../../../installer-core/src/lib/models/ui-node.model';
import { UiRenderer } from '../ui-renderer/ui-renderer';
import { TauriCommandService } from '../../core/services/tauri-command.service';
import { TauriCommand } from '../../core/enums/tauri-command.enum';
import { generateGlobalCSS } from 'installer-core';

@Component({
    selector: 'app-page-renderer',
    imports: [UiRenderer],
    templateUrl: './page-renderer.html',
    styleUrl: './page-renderer.css',
})
export class PageRenderer {
    page = signal<UIPage | null>(null);

    styleEl?: HTMLStyleElement;

    constructor(private renderer: Renderer2, private tauriCommandService: TauriCommandService) {
        effect(() => {
            const page = this.page();
            if (page) {
                this.render(page);
            }
        });
    }

    async ngOnInit() {
        // await this.getUIPage();

        const page: UIPage = {
            styles: { global: { '*': { boxSizing: 'border-box' }, body: { margin: '0' } } },
            root: {
                type: 'div',
                class: ['welcome-container'],
                attrs: { class: 'welcome-container' },
                children: [
                    { type: 'h1', children: [{ type: 'text', text: 'Chào mừng bạn!' }] },
                    { type: 'a', attrs: { 'prop-href': 'appDir' } },
                    {
                        type: 'button',
                        attrs: { 'event-click': 'print' },
                        children: [{ type: 'text', text: 'Bắt đầu' }],
                    },
                ],
            },
        };

        this.page.set(page);
    }

    private async getUIPage() {
        const page = await this.tauriCommandService.invokeCommand<UIPage>(
            TauriCommand.READ_DATA_FROM_EXE_COMMAND,
            {}
        );

        if (!page) {
            return;
        }
        this.page.set(page);
    }

    private render(page: UIPage) {
        const rawCSS = generateGlobalCSS(page.styles.global);
        const scopedCSS = this.scopeCSS(rawCSS, '.ui-page-scope');

        if (this.styleEl) {
            this.styleEl.remove();
        }
        this.styleEl = this.renderer.createElement('style');

        if (this.styleEl) {
            this.styleEl.textContent = scopedCSS;
            this.styleEl.setAttribute('data-page-render', 'true');
        }

        this.renderer.appendChild(document.head, this.styleEl);
    }

    scopeCSS(css: string, scope: string): string {
        return (
            css
                // body, html → scope
                .replace(/\b(body|html)\b/g, scope)
                // prefix selectors
                .replace(/(^|\})\s*([^{]+)/g, (_, sep, selectors) => {
                    const scoped = selectors
                        .split(',')
                        .map((s: any) => {
                            s = s.trim();
                            if (!s || s.startsWith(scope)) return s;
                            return `${scope} ${s}`;
                        })
                        .join(', ');
                    return `${sep} ${scoped}`;
                })
        );
    }

    ngOnDestroy() {
        this.styleEl?.remove();
    }
}
