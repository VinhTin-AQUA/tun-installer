import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

var RegistryValueType;
(function (RegistryValueType) {
    RegistryValueType["REG_NONE"] = "REG_NONE";
    RegistryValueType["REG_SZ"] = "REG_SZ";
    RegistryValueType["REG_EXPAND_SZ"] = "REG_EXPAND_SZ";
    RegistryValueType["REG_DWORD"] = "REG_DWORD";
    RegistryValueType["REG_QWORD"] = "REG_QWORD";
    RegistryValueType["REG_BINARY"] = "REG_BINARY";
    RegistryValueType["REG_MULTI_SZ"] = "REG_MULTI_SZ";
})(RegistryValueType || (RegistryValueType = {}));

const initialState$2 = {
    productName: '',
    icon: '',
    productVersion: '',
    publisher: '',
    supportLink: '',
    supportEmail: '',
    comment: '',
    launchFile: '',
    runAsAdmin: false,
    launchApp: false,
    shortcutInDesktop: {
        isCreated: false,
        runAsAdmin: false,
        runFile: '',
        shortcutName: '',
    },
    shortcutInApplicationShortcut: {
        isCreated: false,
        runAsAdmin: false,
        runFile: '',
        shortcutName: '',
    },
    installationLocation: '',
};
const InstallerPropertyStore = signalStore({
    providedIn: 'root',
}, withState(initialState$2), withMethods((store) => {
    function update(updates) {
        patchState(store, (currentState) => ({
            ...updates,
        }));
    }
    function getData() {
        const data = {
            installationLocation: store.installationLocation(),
            productName: store.productName(),
            icon: store.icon(),
            productVersion: store.productVersion(),
            publisher: store.publisher(),
            supportLink: store.supportLink(),
            supportEmail: store.supportEmail(),
            comment: store.comment(),
            launchFile: store.launchFile(),
            runAsAdmin: store.runAsAdmin(),
            launchApp: store.launchApp(),
            shortcutInDesktop: store.shortcutInDesktop(),
            shortcutInApplicationShortcut: store.shortcutInApplicationShortcut(),
        };
        return data;
    }
    return {
        update,
        getData,
    };
}));

const initialState$1 = {
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
const RegistryKeyStore = signalStore({
    providedIn: 'root',
}, withState(initialState$1), withMethods((store) => {
    function updateRegistry(update) {
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
        const data = {
            configRegistry: store.configRegistry(),
            uninstallRegistry: store.uninstallRegistry(),
        };
        return data;
    }
    function addValue(key, value) {
        patchState(store, (state) => ({
            [key]: {
                ...state[key],
                values: [...state[key].values, value],
            },
        }));
    }
    function updateValue(key, valueName, update) {
        patchState(store, (state) => ({
            [key]: {
                ...state[key],
                values: state[key].values.map((v) => v.name === valueName ? { ...v, ...update } : v),
            },
        }));
    }
    function upsertValue(key, value) {
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
    function removeValue(key, valueName) {
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
}));

const initialState = {
    title: 'Tun Installer',
    width: 800,
    height: 600,
    startPage: '',
    alwaysOnTop: false,
};
const WindowInfoStore = signalStore({
    providedIn: 'root',
}, withState(initialState), withMethods((store) => {
    function getData() {
        const data = {
            title: store.title(),
            width: store.width(),
            height: store.height(),
            startPage: store.startPage(),
            alwaysOnTop: store.alwaysOnTop(),
        };
        return data;
    }
    function updateValue(value) {
        patchState(store, (currentState) => ({
            ...value,
        }));
    }
    return {
        getData,
        updateValue,
    };
}));

/*
 * Public API Surface of installer-core
 */

/**
 * Generated bundle index. Do not edit.
 */

export { InstallerPropertyStore, RegistryKeyStore, RegistryValueType, WindowInfoStore };
//# sourceMappingURL=installer-core.mjs.map
