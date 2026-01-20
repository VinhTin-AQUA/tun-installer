import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavItem } from './models/nav-item';
import { filter } from 'rxjs';
import { MainRoutes } from '../../../core/enums/routes.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { WorkingConfigFileStore } from '../../stores/working-config.store';
import { TitleBar } from "../../components/title-bar/title-bar";

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, RouterLink, TranslatePipe, RouterLinkActive, TitleBar],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
})
export class MainLayout {
    isDrawerOpen = false;
    navItems: NavItem[] = [];
    installerDocumentStore = inject(WorkingConfigFileStore);

    constructor(private router: Router) {}

    ngOnInit() {
        this.navItems = [
            {
                name: 'menuSidebar.productDetails',
                url: MainRoutes.ProductDetails,
            },
             {
                name: 'menuSidebar.htmlEngine',
                url: MainRoutes.HtmlEngine,
            },
            {
                name: 'menuSidebar.filesAndFolders',
                url: MainRoutes.FilesAndFolders,
            },
            {
                name: 'menuSidebar.registry',
                url: MainRoutes.Registry,
            },
            {
                name: 'menuSidebar.settings',
                url: MainRoutes.Settings,
            },
        ];

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (this.isDrawerOpen) {
                this.toggleDrawer();
            }
        });
    }

    toggleDrawer() {
        this.isDrawerOpen = !this.isDrawerOpen;

        if (this.isDrawerOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }
}
