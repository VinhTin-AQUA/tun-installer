import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { InstallerProperties } from '../models/installer-properties';

const initialState: InstallerProperties = {
    appDir: '',
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
