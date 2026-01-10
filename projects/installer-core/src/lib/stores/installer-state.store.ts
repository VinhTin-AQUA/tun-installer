import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { InstallerProperties } from '../models/installer-properties';

const initialState: InstallerProperties = {
    projectDir: '',
    pageDir: '',
    installationLocation: '',
    productName: '',
    icon: '',
    productVersion: '',
    publisher: '',
    supportLink: '',
    supportEmail: '',
    comment: '',
    sourceDir: '',
    launchFile: '',
    runAsAdmin: false,
    launchApp: false,
    shortcutInDesktop: {
        isCreated: false,
        runAsAdmin: false,
        runFile: '',
        shortcutName: '',
    },
    shortcutInApplicationShortcut: {
        isCreated: false,
        runAsAdmin: false,
        runFile: '',
        shortcutName: '',
    },
};

export const InstallerPropertyStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function update(updates: Partial<InstallerProperties>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        return {
            update,
        };
    })
);
