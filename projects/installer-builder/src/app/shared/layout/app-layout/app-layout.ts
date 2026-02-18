import { Component } from '@angular/core';
import { TitleBar } from '../../components/title-bar/title-bar';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-app-layout',
    imports: [TitleBar, RouterOutlet],
    templateUrl: './app-layout.html',
    styleUrl: './app-layout.css',
})
export class AppLayout {}
