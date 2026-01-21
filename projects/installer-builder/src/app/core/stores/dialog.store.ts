import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type Dialogs = {
    createNewProjectDialog: boolean;
};

const initialState: Dialogs = {
    createNewProjectDialog: false,
};

export const DialogStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function update(updates: Partial<Dialogs>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        return {
            update,
        };
    }),
);
