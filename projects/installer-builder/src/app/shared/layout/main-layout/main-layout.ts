import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavItem } from './models/nav-item';
import { filter } from 'rxjs';
import { MainRoutes } from '../../../core/enums/routes.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectStore } from '../../../core/stores/project-store';
import { MainTitleBar } from '../../components/main-title-bar/main-title-bar';
import { ProjectManagerService } from '../../../core/services/project-manager-service';
import { ProjectStateService } from '../../../core/services/project-state-service';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, RouterLink, TranslatePipe, RouterLinkActive, MainTitleBar],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
})
export class MainLayout {
    isDrawerOpen = false;
    navItems: NavItem[] = [];
    installerDocumentStore = inject(ProjectStore);
    isLoading = signal(true);

    constructor(
        private router: Router,
        private projectStateService: ProjectStateService,
        private projectManagerService: ProjectManagerService,
    ) {}

    async ngOnInit() {
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
                name: 'menuSidebar.prerequisites',
                url: MainRoutes.Prerequisites,
            },
            {
                name: 'menuSidebar.registry',
                url: MainRoutes.Registry,
            },
            {
                name: 'menuSidebar.buildInstaller',
                url: MainRoutes.BuildInstaller,
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
        await this.init();
    }

    private async init() {
        try {
            await this.projectStateService.getProjectState();
            await this.projectManagerService.init();
        } finally {
            this.isLoading.set(false);
        }
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
