import { Component, inject, signal } from '@angular/core';
import { FolderNode, FileItem } from '../../core/models/directory-tree';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { InstallerPropertyStore } from 'data-access';
import { TauriCommandService } from '../../core/tauri/tauri-command-service';
import { ProjectStore } from '../../core/stores/project-store';
import { ProjectManagerCommands } from '../../core/enums/commands';
import { ResourceFiletore } from '../../core/stores/resource-file.store';
import { ProjectManagerService } from '../../core/services/project-manager-service';

@Component({
    selector: 'app-files-and-folders',
    imports: [NgTemplateOutlet, DecimalPipe],
    templateUrl: './files-and-folders.html',
    styleUrl: './files-and-folders.css',
})
export class FilesAndFolders {
    folders = signal<FolderNode[]>([
        {
            id: 'resources',
            name: 'Resources',
            expanded: false,
            children: [],
        }
    ]);

    files = signal<FileItem[]>([]);

    // resourceFolder: string = '';
    // prerequisites: string = '';

    selectedFolderId: string = 'resources';
    openedMenuFileId?: string;
    installerProperties = inject(InstallerPropertyStore);
    projectStore = inject(ProjectStore);
    resourceFiletore = inject(ResourceFiletore);

    constructor(
        private tauriCommandService: TauriCommandService,
        private projectManagerService: ProjectManagerService,
    ) {}

    async ngOnInit() {
        const resources = await this.tauriCommandService.invokeCommand<FolderNode[], object>(
            ProjectManagerCommands.READ_SUBFOLDERS_COMMAND,
            {
                path: this.projectStore.resourceDir(),
            },
        );
        if (!resources) {
            return;
        }

        this.folders.update((x) => {
            x[0].children = resources;
            return x;
        });
        await this.getFilesInFolder('resources');
    }

    async expandFolder(folder: FolderNode) {
        folder.expanded = !folder.expanded;

        this.openedMenuFileId = undefined;
    }

    async getFilesInFolder(folder: string): Promise<FileItem[]> {
        this.selectedFolderId = folder;
        const files = await this.tauriCommandService.invokeCommand<FileItem[], object>(
            ProjectManagerCommands.READ_FILES_IN_FOLDER_COMMAND,
            {
                path: `${this.projectStore.projectDir()}/${folder}`,
            },
        );

        if (!files) {
            this.files.set([]);
            return [];
        }
        this.files.set(files);
        return files;
    }

    reset() {
        this.getFilesInFolder(this.selectedFolderId);
        this.projectManagerService.getResourceFiles();
    }

    // get filesInSelectedFolder(): FileItem[] {
    //     return this.files().filter((f) => f.folderId === this.selectedFolderId);
    // }

    toggleContextMenu(fileId: string, event: MouseEvent) {
        event.stopPropagation();
        this.openedMenuFileId = this.openedMenuFileId === fileId ? undefined : fileId;
    }

    action(name: string, file: FileItem) {
        alert(`${name}: ${file.name}`);
        this.openedMenuFileId = undefined;
    }

    // hasChildren(folderId: string): boolean {
    //     const find = (nodes: any[]): boolean => {
    //         for (const n of nodes) {
    //             if (n.id === folderId) {
    //                 return !!n.children && n.children.length > 0;
    //             }
    //             if (n.children && find(n.children)) return true;
    //         }
    //         return false;
    //     };

    //     const hasChildren = find(this.folders);

    //     return hasChildren;
    // }

    // getFolderIcon(folder: any): string {
    //     if (this.hasChildren(folder.id)) {
    //         return '>📁';
    //     }
    //     return '📁';
    // }
}
