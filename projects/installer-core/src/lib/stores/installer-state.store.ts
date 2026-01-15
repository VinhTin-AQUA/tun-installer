import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { InstallerProperties } from '../models/installer-properties';

const initialState: InstallerProperties = {
    projectDir: '',
    installationLocation: '',
    productName: '',
    icon: '',
    productVersion: '',
    publisher: '',
    supportLink: '',
    supportEmail: '',
    comment: '',
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

        function getData() {
            const data: InstallerProperties = {
                projectDir: store.projectDir(),
                installationLocation: store.installationLocation(),
                productName: store.productName(),
                icon: store.icon(),
                productVersion: store.productVersion(),
                publisher: store.publisher(),
                supportLink: store.supportLink(),
                supportEmail: store.supportEmail(),
                comment: store.comment(),
                launchFile: store.launchFile(),
                runAsAdmin: store.runAsAdmin(),
                launchApp: store.launchApp(),
                shortcutInDesktop: store.shortcutInDesktop(),
                shortcutInApplicationShortcut: store.shortcutInApplicationShortcut(),
            };

            return data;
        }

        return {
            update,
            getData,
        };
    })
);
