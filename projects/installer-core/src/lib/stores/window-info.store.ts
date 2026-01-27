import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WindowInfo } from '../models';

const initialState: WindowInfo = {
    title: 'Tun Installer',
    width: 800,
    height: 600,
    startPage: '',
    alwaysOnTop: false,
};

export const WindowInfoStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function getData() {
            const data: WindowInfo = {
                title: store.title(),
                width: store.width(),
                height: store.height(),
                startPage: store.startPage(),
                alwaysOnTop: store.alwaysOnTop(),
            };
            return data;
        }

        function updateValue(value: Partial<WindowInfo>) {
            patchState(store, (currentState) => ({
                ...value,
            }));
        }

        return {
            getData,
            updateValue,
        };
    }),
);
