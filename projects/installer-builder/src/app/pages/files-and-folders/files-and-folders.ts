import { Component, inject, signal } from '@angular/core';
import { FolderNode, FileItem } from './models/directory-tree';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { InstallerPropertyStore } from 'installer-core';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { Commands } from '../../core/enums/commands';
import { ProjectFolders } from '../../core/consts/folder.const';

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
        },
        {
            id: 'prerequisites',
            name: 'Prerequisites',
            expanded: false,
            children: [],
        },
    ]);

    files = signal<FileItem[]>([]);

    resourceFolder: string = '';
    prerequisites: string = '';

    selectedFolderId: string = 'resources';
    openedMenuFileId?: string;
    installerProperties = inject(InstallerPropertyStore);

    constructor(private tauriCommandService: TauriCommandService) {}

    async ngOnInit() {
        this.resourceFolder = `${this.installerProperties.projectDir()}/${ProjectFolders.resources}`;
        this.prerequisites = `${this.installerProperties.projectDir()}/${ProjectFolders.prerequisites}`;

        const resources = await this.tauriCommandService.invokeCommand<FolderNode[]>(
            Commands.READ_SUBFOLDERS_COMMAND,
            {
                path: this.resourceFolder,
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

    async selectFolder(folder: FolderNode) {
        folder.expanded = !folder.expanded;
        this.selectedFolderId = folder.id;
        this.openedMenuFileId = undefined;
    }

    async getFilesInFolder(folder: string) {
        const files = await this.tauriCommandService.invokeCommand<FileItem[]>(
            Commands.READ_FILES_IN_FOLDER_COMMAND,
            {
                path: `${this.installerProperties.projectDir()}/${folder}`,
            },
        );

        if (!files) {
            this.files.set([]);
            return;
        }
        this.files.set(files);
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
