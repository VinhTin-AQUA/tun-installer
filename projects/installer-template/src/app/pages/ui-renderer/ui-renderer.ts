import { Component, Input } from '@angular/core';
import { UINode } from '../../core/models/ui-node.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attrs } from "../../shared/directives/attrs";

@Component({
    selector: 'app-ui-renderer',
    imports: [CommonModule, FormsModule, Attrs],
    templateUrl: './ui-renderer.html',
    styleUrl: './ui-renderer.css',
})
export class UiRenderer {
    @Input() node!: UINode;

    ngOnInit() {}

    print() {
        console.log('hello world');
    }
}
