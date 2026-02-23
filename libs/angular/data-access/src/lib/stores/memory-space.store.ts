import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MemorySpace } from '../models/memory-space';

const initialState: MemorySpace = {
    volumeSpaceAvailable: '0MB',
    volumeSpaceRemaining: '0MB',
    volumeSpaceRequired: '0MB',
};

export const MemorySpaceStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function update(updates: Partial<MemorySpace>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        function getData() {
            const data: MemorySpace = {
                volumeSpaceAvailable: store.volumeSpaceAvailable(),
                volumeSpaceRemaining: store.volumeSpaceRemaining(),
                volumeSpaceRequired: store.volumeSpaceRequired(),
            };

            return data;
        }

        return {
            update,
            getData,
        };
    }),
);
