import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language-service';
import { Toast } from "./shared/components/toast/toast";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Toast],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-builder');
    constructor(private languageService: LanguageService) {}
}
