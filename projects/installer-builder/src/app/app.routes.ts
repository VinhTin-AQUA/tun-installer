import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { UiEditor } from './pages/ui-editor/ui-editor';
import { HtmlEngine } from './pages/html-engine/html-engine';
import { ProductDetails } from './pages/product-details/product-details';
import { FilesAndFolders } from './pages/files-and-folders/files-and-folders';
import { Registry } from './pages/registry/registry';
import { MainRoutes } from './core/enums/routes.enum';
import { Settings } from './pages/settings/settings';
import { PreviewInstallerUi } from './pages/preview-installer-ui/preview-installer-ui';

export const routes: Routes = [
    {
        path: MainRoutes.Main,
        component: MainLayout,
        children: [
            {
                path: MainRoutes.UiEditor,
                component: UiEditor,
            },
            {
                path: MainRoutes.HtmlEngine,
                component: HtmlEngine,
            },
            {
                path: MainRoutes.ProductDetails,
                component: ProductDetails,
            },
            {
                path: MainRoutes.FilesAndFolders,
                component: FilesAndFolders,
            },
            {
                path: MainRoutes.Registry,
                component: Registry,
            },
            {
                path: MainRoutes.Settings,
                component: Settings,
            },

            { path: '', redirectTo: MainRoutes.HtmlEngine, pathMatch: 'full' },
        ],
    },
    {
        path: 'preview-installer-ui',
        component: PreviewInstallerUi,
    },
    { path: '**', redirectTo: '' },
];
