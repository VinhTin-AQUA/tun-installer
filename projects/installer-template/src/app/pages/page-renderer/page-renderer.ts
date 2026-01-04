import { Component, effect, Renderer2, signal } from '@angular/core';
import { UIPage } from '../../core/models/ui-node.model';
import { generateGlobalCSS } from '../../shared/helpers/html-json-parser.helper';
import { UiRenderer } from '../ui-renderer/ui-renderer';
import { TauriCommandService } from '../../core/services/tauri-command.service';
import { TauriCommand } from '../../core/enums/tauri-command.enum';

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
        await this.getUIPage();
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
