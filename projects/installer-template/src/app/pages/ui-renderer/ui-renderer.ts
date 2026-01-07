import { Component, inject, Input } from '@angular/core';
import { UINode } from '../../../../../installer-core/src/lib/models/ui-node.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attrs } from "../../shared/directives/attrs";
import {InstallerPropertyStore} from 'installer-core'

@Component({
    selector: 'app-ui-renderer',
    imports: [CommonModule, FormsModule, Attrs],
    templateUrl: './ui-renderer.html',
    styleUrl: './ui-renderer.css',
})
export class UiRenderer {
    @Input() node!: UINode;


    installerPropertyStore = inject(InstallerPropertyStore);

    appDir = this.installerPropertyStore.appDir();
    productName = this.installerPropertyStore.productName();
    icon = this.installerPropertyStore.icon();
    productVersion = this.installerPropertyStore.productVersion();
    publisher = this.installerPropertyStore.publisher();
    supportLink = this.installerPropertyStore.supportLink();
    supportEmail = this.installerPropertyStore.supportEmail();
    comment = this.installerPropertyStore.comment();
    buildDir = this.installerPropertyStore.buildDir();
    fileToRun = this.installerPropertyStore.fileToRun();
    runAsAdmin = this.installerPropertyStore.runAsAdmin();
    lauchApp = this.installerPropertyStore.lauchApp();

    ngOnInit() {
        this.installerPropertyStore.update({appDir: 'https://www.google.com/'})
    }

    print() {
        console.log('hello world');
    }
}
