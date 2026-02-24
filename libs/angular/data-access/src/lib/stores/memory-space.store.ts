import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MemorySpace } from '../models/memory-space';

const initialState: MemorySpace = {
    volumeSpaceAvailable: 0,
    volumeSpaceRemaining: 0,
    volumeSpaceRequired: 0,
};

export const MemorySpaceStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function setMemorySpace(model: MemorySpace) {
            patchState(store, (currentState) => ({
                ...model,
            }));
        }

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

        return { setMemorySpace, update, getData };
    }),
);
