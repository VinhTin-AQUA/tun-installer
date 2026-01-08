import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { UiEditor } from './pages/ui-editor/ui-editor';
import { HtmlEngine } from './pages/html-engine/html-engine';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'home',
                component: UiEditor,
            },
            {
                path: 'html-engine',
                component: HtmlEngine,
            },
            { path: '', redirectTo: 'html-engine', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' },
];
