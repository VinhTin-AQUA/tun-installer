export interface FolderNode {
    id: string;
    name: string;
    children?: FolderNode[];
    expanded: boolean;
}

export interface FileItem {
    id: string;
    folderId: string;
    name: string;
    size: number;
    type: string;
    physicalPath: string;
}
