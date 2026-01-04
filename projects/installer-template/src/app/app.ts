import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageRenderer } from "./pages/page-renderer/page-renderer";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, PageRenderer],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-template');
}
