import { Injectable } from '@angular/core';
import { EventCallback, listen, Options, UnlistenFn } from '@tauri-apps/api/event';

@Injectable({
    providedIn: 'root',
})
export class TauriEventService {
    constructor() {}

    async listenEvent<T>(
        eventName: string,
        handler: EventCallback<T>,
        options?: Options,
    ): Promise<UnlistenFn> {
        const unlisten = await listen<T>(eventName, handler, options);
        return unlisten;
    }
}
