import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { UiEditor } from './pages/ui-editor/ui-editor';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'home',
                component: UiEditor,
            },

            { path: '', redirectTo: 'home', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' },
];

