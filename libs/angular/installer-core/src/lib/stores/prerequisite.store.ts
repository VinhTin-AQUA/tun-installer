import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Prerequisite } from '../models';

type Prerequisites = {
    prerequisites: Prerequisite[];
};

const initialState: Prerequisites = {
    prerequisites: [],
};

export const PrerequisiteStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function getData() {
            return store.prerequisites();
        }

        function setList(list: Prerequisite[]) {
            patchState(store, (currentState) => ({
                prerequisites: list,
            }));
        }

        function add(item: Prerequisite) {
            patchState(store, (currentState) => ({
                prerequisites: [...currentState.prerequisites, item],
            }));
        }

        function update(name: string, changes: Partial<Prerequisite>) {
            patchState(store, (currentState) => {
                let item = currentState.prerequisites.find((x) => x.name === name);

                if (item) {
                    item = { ...item, ...changes };
                }

                return {
                    prerequisites: currentState.prerequisites,
                };
            });
        }

        return {
            getData,
            setList,
            add,
            update,
        };
    }),
);
