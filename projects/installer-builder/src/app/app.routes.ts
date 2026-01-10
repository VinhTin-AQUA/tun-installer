import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { UiEditor } from './pages/ui-editor/ui-editor';
import { HtmlEngine } from './pages/html-engine/html-engine';
import { ProductDetails } from './pages/product-details/product-details';
import { FilesAndFolders } from './pages/files-and-folders/files-and-folders';
import { Registry } from './pages/registry/registry';

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
            {
                path: 'product-details',
                component: ProductDetails,
            },
            {
                path: 'files-and-folders',
                component: FilesAndFolders,
            },
            {
                path: 'registry',
                component: Registry,
            },
            { path: '', redirectTo: 'registry', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' },
];
