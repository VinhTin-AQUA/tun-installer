import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { HtmlEngine } from './pages/main/html-engine/html-engine';
import { ProductDetails } from './pages/main/product-details/product-details';
import { FilesAndFolders } from './pages/main/files-and-folders/files-and-folders';
import { Registry } from './pages/main/registry/registry';
import { AppRoutes, MainRoutes } from './core/enums/routes.enum';
import { PreviewInstallerUi } from './pages/main/preview-installer-ui/preview-installer-ui';
import { BuildInstaller } from './pages/main/build-installer/build-installer';
import { Prerequisites } from './pages/main/prerequisites/prerequisites';
import { AppLayout } from './shared/layout/app-layout/app-layout';
import { Home } from './pages/app/home/home';
import { Settings } from './pages/app/settings/settings';

export const routes: Routes = [
    {
        path: AppRoutes.App,
        component: AppLayout,
        children: [
            {
                path: AppRoutes.Home,
                component: Home,
            },
            {
                path: AppRoutes.Settings,
                component: Settings,
            },
            { path: '', redirectTo: AppRoutes.Home, pathMatch: 'full' },
        ],
    },
    {
        path: MainRoutes.Main,
        component: MainLayout,
        children: [
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
                path: MainRoutes.BuildInstaller,
                component: BuildInstaller,
            },
            {
                path: MainRoutes.Prerequisites,
                component: Prerequisites,
            },
            { path: '', redirectTo: MainRoutes.ProductDetails, pathMatch: 'full' },
        ],
    },
    {
        path: 'preview-installer-ui',
        component: PreviewInstallerUi,
    },
    { path: '**', redirectTo: AppRoutes.App },
];
