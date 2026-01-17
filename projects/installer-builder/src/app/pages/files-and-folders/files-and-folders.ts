import { Component, inject } from '@angular/core';
import { FolderNode, FileItem } from './models/directory-tree';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { InstallerPropertyStore } from 'installer-core';
import { TauriCommandService } from '../../core/services/tauri-command-service';
import { Commands } from '../../core/enums/commands';

@Component({
    selector: 'app-files-and-folders',
    imports: [NgTemplateOutlet, DecimalPipe],
    templateUrl: './files-and-folders.html',
    styleUrl: './files-and-folders.css',
})
export class FilesAndFolders {
    folders: FolderNode[] = [
        {
            id: 'build-dir',
            name: 'Build Dir',
            expanded: false,
            children: [],
        },
        {
            id: 'prerequisites',
            name: 'Prerequisites',
            expanded: false,
            children: [],
        },
        {
            id: 'root',
            name: 'Root',
            expanded: false,
            children: [
                {
                    id: 'docs',
                    name: 'Documents',
                    children: [
                        { id: 'reports', name: 'Reports', expanded: false },
                        { id: 'letters', name: 'Letters', expanded: false },
                    ],
                    expanded: false,
                },
                {
                    id: 'images',
                    name: 'Images',
                    expanded: false,
                },
            ],
        },
    ];

    files: FileItem[] = [
        {
            id: 'f1',
            folderId: 'root',
            name: 'readme.txt',
            size: 1200,
            type: 'txt',
            physicalPath: 'C:/root/readme.txt',
        },
        {
            id: 'f2',
            folderId: 'docs',
            name: 'document.docx',
            size: 20480,
            type: 'docx',
            physicalPath: 'C:/docs/document.docx',
        },
        {
            id: 'f3',
            folderId: 'images',
            name: 'photo.png',
            size: 512000,
            type: 'png',
            physicalPath: 'C:/images/photo.png',
        },
    ];

    selectedFolderId: string = 'root';
    openedMenuFileId?: string;
    installerProperties = inject(InstallerPropertyStore);

    constructor(private tauriCommandService: TauriCommandService) {}

    async ngOnInit() {
        const folders = await this.tauriCommandService.invokeCommand(Commands.READ_SUBFOLDERS_COMMAND, {
            path: this.installerProperties.projectDir(),
        });

        console.log(folders);
        
    }

    selectFolder(folder: FolderNode) {
        folder.expanded = !folder.expanded;
        this.selectedFolderId = folder.id;
        this.openedMenuFileId = undefined;
    }

    get filesInSelectedFolder(): FileItem[] {
        return this.files.filter((f) => f.folderId === this.selectedFolderId);
    }

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
