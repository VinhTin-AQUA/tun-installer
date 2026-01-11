import { Component, inject } from '@angular/core';
import grapesjs from 'grapesjs';
import { FormsModule } from '@angular/forms';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { Commands } from '../../core/enums/commands';
import { WriteDataExe } from '../../core/models/tauri-payloads/write-data-exe';
import { convertHtmlCssToJson } from 'installer-core';

@Component({
    selector: 'app-ui-editor',
    imports: [FormsModule],
    templateUrl: './ui-editor.html',
    styleUrl: './ui-editor.css',
})
export class UiEditor {
    editor: any;
    isPreview = false;

    htmlCode = `<div class="box">
    <h1>Hello GrapesJS</h1>
</div>`;

    cssCode = `.box {
    padding: 40px;
    background: #f3f4f6;
    text-align: center;
}`;

  

    constructor(private tauriCommandService: TauriCommandService) {}

    ngAfterViewInit(): void {
        this.editor = grapesjs.init({
            container: '#gjs',
            height: '100%',
            width: '100%',
            storageManager: false, // prevent saving html + css before

            panels: { defaults: [] },
            blockManager: { appendTo: undefined },
            layerManager: { appendTo: undefined },
            styleManager: { appendTo: undefined },
            traitManager: { appendTo: undefined },

            components: '',
            style: '',
        });
        const wrapper = this.editor.getWrapper();
        wrapper.set({
            droppable: false,
            selectable: false,
            hoverable: false,
        });

        this.editor.on('load', () => {
            const frame = this.editor.Canvas.getFrameEl();
            const body = frame?.contentDocument?.body;

            if (body) {
                body.style.overflow = 'hidden';
            }
        });

        this.applyCode();
    }

    applyCode() {
        this.editor.setComponents(this.htmlCode || '');
        this.editor.setStyle(this.cssCode || '');
    }

    exportHtml() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();

        // console.log('HTML:', html);
        // console.log('CSS:', css);

        const uiPage = convertHtmlCssToJson(html, css);

        console.log(uiPage);
    }

    togglePreview() {
        this.isPreview = !this.isPreview;

        if (this.isPreview) {
            this.editor.runCommand('preview');
        } else {
            this.editor.stopCommand('preview');
        }
    }

    undo() {
        this.editor.UndoManager.undo();
    }

    redo() {
        this.editor.UndoManager.redo();
    }

    clearCanvas() {
        this.editor.DomComponents.clear();
    }

    async buildExe() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        const uiPage = convertHtmlCssToJson(html, css);
        const data: WriteDataExe = {
            data: JSON.stringify(uiPage),
        };

        console.log(JSON.stringify(uiPage));

        // const check = await this.tauriCommandService.invokeCommand(
        //     Commands.WRITE_DATA_TO_EXE_COMMAND,
        //     data
        // );
        // console.log(check);
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.destroy();
        }
    }
}
