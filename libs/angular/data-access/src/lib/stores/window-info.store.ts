import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WindowInfo, WindowInfos } from '../models';

const initialState: WindowInfos = {
    installerWindow: {
        title: 'Tun Installer',
        width: 800,
        height: 600,
        startPage: '',
        alwaysOnTop: false,
    },
    uninstallerWindow: {
        title: 'Tun Installer',
        width: 800,
        height: 600,
        startPage: '',
        alwaysOnTop: false,
    },
};

export const WindowInfoStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function setWindows(data: WindowInfos) {
            patchState(store, (currentState) => ({
                ...data,
            }));
        }

        function getData() {
            const data: WindowInfos = {
                installerWindow: store.installerWindow(),
                uninstallerWindow: store.uninstallerWindow(),
            };
            return data;
        }

        // function updateValue(value: Partial<WindowInfos>) {
        //     patchState(store, (currentState) => ({
        //         ...value,
        //     }));
        // }

        function updateWindow(key: keyof WindowInfos, value: Partial<WindowInfo>) {
            patchState(store, (state) => ({
                [key]: {
                    ...state[key],
                    ...value,
                },
            }));
        }
        return {
            setWindows,
            getData,
            updateWindow,
        };
    }),
);
