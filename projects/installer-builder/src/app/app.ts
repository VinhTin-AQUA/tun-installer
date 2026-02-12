import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language-service';
import { Toast } from './shared/components/toast/toast';
import { Dialogs } from './shared/components/dialogs/dialogs';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Toast, Dialogs],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected readonly title = signal('installer-builder');

    constructor(private languageService: LanguageService) {}
}
