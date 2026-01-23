import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { FileItem } from '../models/directory-tree';

type FileItems = {
    fileItems: FileItem[];
};

const initialState: FileItems = {
    fileItems: [],
};

export const ResourceFiletore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function addList(list: FileItem[]) {
            patchState(store, (state) => {
                return {
                    fileItems: [...state.fileItems, ...list],
                };
            });
        }

        function setList(list: FileItem[]) {
            patchState(store, (state) => {
                return {
                    fileItems: list,
                };
            });
        }

        function getAll() {
            return store.fileItems();
        }

        return {
            addList,
            getAll,
            setList,
        };
    }),
);
