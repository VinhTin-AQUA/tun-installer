import { open } from '@tauri-apps/plugin-dialog';

export class FileHelper {
    static async selectFile() {
        const selected = await open({
            directory: false,
            multiple: false,
        });

        if (typeof selected === 'string') {
            return selected;
        }
        return null;
    }
}
