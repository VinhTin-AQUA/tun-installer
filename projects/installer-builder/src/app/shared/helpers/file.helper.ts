import { open } from '@tauri-apps/plugin-dialog';

export class FileHelper {
    static async selectFile(filters: { name: string; extensions: string[] }[] = []) {
        const selected = await open({
            directory: false,
            multiple: false,
            filters: filters,
        });

        if (typeof selected === 'string') {
            return selected;
        }
        return null;
    }
}
