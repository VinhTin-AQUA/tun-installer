import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { RegistryKey, RegistryKeys, RegistryValue } from '../models';

const initialState: RegistryKeys = {
    configRegistry: {
        name: '',
        path: '',
        values: [],
    },
    uninstallRegistry: {
        name: '',
        path: '',
        values: [],
    },
};

export const RegistryKeyStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function updateRegistry(update: RegistryKeys) {
            patchState(store, (state) => ({
                ...update,
            }));
        }

        // function updateConfigRegistry(update: RegistryKeys) {
        //     patchState(store, (state) => ({
        //         configRegistry: {
        //             ...state.configRegistry,
        //             ...update,
        //         },
        //     }));
        // }

        // function updateUninstallRegistry(update: RegistryKeys) {
        //     patchState(store, (state) => ({
        //         uninstallRegistry: {
        //             ...state.uninstallRegistry,
        //             ...update,
        //         },
        //     }));
        // }

        function getData() {
            const data: RegistryKeys = {
                configRegistry: store.configRegistry(),
                uninstallRegistry: store.uninstallRegistry(),
            };
            return data;
        }

        function addValue(key: keyof RegistryKeys, value: RegistryValue) {
            patchState(store, (state) => ({
                [key]: {
                    ...state[key],
                    values: [...state[key].values, value],
                },
            }));
        }

        function updateValue(
            key: keyof RegistryKeys,
            valueName: string,
            update: Partial<RegistryValue>,
        ) {
            patchState(store, (state) => ({
                [key]: {
                    ...state[key],
                    values: state[key].values.map((v) =>
                        v.name === valueName ? { ...v, ...update } : v,
                    ),
                },
            }));
        }

        function upsertValue(key: keyof RegistryKeys, value: RegistryValue) {
            patchState(store, (state) => {
                const exists = state[key].values.some((v) => v.name === value.name);

                return {
                    [key]: {
                        ...state[key],
                        values: exists
                            ? state[key].values.map((v) => (v.name === value.name ? value : v))
                            : [...state[key].values, value],
                    },
                };
            });
        }

        function removeValue(key: keyof RegistryKeys, valueName: string) {
            patchState(store, (state) => ({
                [key]: {
                    ...state[key],
                    values: state[key].values.filter((v) => v.name !== valueName),
                },
            }));
        }

        return {
            updateRegistry,
            // updateConfigRegistry,
            // updateUninstallRegistry,
            getData,
            addValue,
            updateValue,
            removeValue,
            upsertValue,
        };
    }),
);
