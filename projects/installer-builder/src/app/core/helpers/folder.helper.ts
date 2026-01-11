import { open } from '@tauri-apps/plugin-dialog';

export class FolderHelper {
    static async selectFolder() {
        const selected = await open({
            directory: true,
            multiple: false,
        });

        if (typeof selected === 'string') {
            return selected;
        }
        return null;
    }
}
