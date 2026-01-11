import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { InstallerDocument } from '../../core/models/installer-document.model';

const initialState: InstallerDocument = {
    content: '',
    filePath: null,
    isDirty: false,
};

export const InstallerDocumentStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function update(updates: Partial<InstallerDocument>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        return {
            update,
        };
    })
);
