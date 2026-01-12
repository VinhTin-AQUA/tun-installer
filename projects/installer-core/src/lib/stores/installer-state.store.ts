import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { InstallerProperties } from '../models/installer-properties';

const initialState: InstallerProperties = {
    projectDir: 'Choose project directory',
    installationLocation: 'C:/ProgramFiles',
    productName: 'Your App',
    icon: 'icon.ico',
    productVersion: '1.0.0',
    publisher: 'Your Company',
    supportLink: 'https://example.com/',
    supportEmail: 'example@gmail.com',
    comment: 'Your comment',
    launchFile: 'your-app.exe',
    runAsAdmin: false,
    launchApp: false,
    shortcutInDesktop: {
        isCreated: false,
        runAsAdmin: false,
        runFile: 'your-app.exe',
        shortcutName: 'Your App',
    },
    shortcutInApplicationShortcut: {
        isCreated: false,
        runAsAdmin: false,
        runFile: 'your-app.exe',
        shortcutName: 'Your App',
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
