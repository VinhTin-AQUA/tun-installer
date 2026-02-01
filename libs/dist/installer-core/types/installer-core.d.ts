import * as _ngrx_signals from '@ngrx/signals';
import * as installer_core from 'installer-core';
import * as _angular_core from '@angular/core';

interface InstallerProperties {
    installationLocation: string;
    productName: string;
    icon: string;
    productVersion: string;
    publisher: string;
    supportLink: string;
    supportEmail: string;
    comment: string;
    launchFile: string;
    runAsAdmin: boolean;
    launchApp: boolean;
    shortcutInDesktop: ShortcutInDesktop;
    shortcutInApplicationShortcut: ShortcutInApplicationShortcut;
}
interface ShortcutInDesktop {
    isCreated: boolean;
    runAsAdmin: boolean;
    shortcutName: string;
    runFile: string;
}
interface ShortcutInApplicationShortcut {
    isCreated: boolean;
    runAsAdmin: boolean;
    shortcutName: string;
    runFile: string;
}

declare enum RegistryValueType {
    REG_NONE = "REG_NONE",
    REG_SZ = "REG_SZ",
    REG_EXPAND_SZ = "REG_EXPAND_SZ",
    REG_DWORD = "REG_DWORD",
    REG_QWORD = "REG_QWORD",
    REG_BINARY = "REG_BINARY",
    REG_MULTI_SZ = "REG_MULTI_SZ"
}
interface RegistryValue {
    name: string;
    type: RegistryValueType;
    data: string | number | string[] | null;
}
interface RegistryKey {
    name: string;
    path: string;
    values: RegistryValue[];
}
interface RegistryKeys {
    configRegistry: RegistryKey;
    uninstallRegistry: RegistryKey;
}

interface WindowInfo {
    title: string;
    width: number;
    height: number;
    startPage: string;
    alwaysOnTop: boolean;
}

declare const InstallerPropertyStore: _angular_core.Type<{
    installationLocation: _angular_core.Signal<string>;
    productName: _angular_core.Signal<string>;
    icon: _angular_core.Signal<string>;
    productVersion: _angular_core.Signal<string>;
    publisher: _angular_core.Signal<string>;
    supportLink: _angular_core.Signal<string>;
    supportEmail: _angular_core.Signal<string>;
    comment: _angular_core.Signal<string>;
    launchFile: _angular_core.Signal<string>;
    runAsAdmin: _angular_core.Signal<boolean>;
    launchApp: _angular_core.Signal<boolean>;
    shortcutInDesktop: _ngrx_signals.DeepSignal<installer_core.ShortcutInDesktop>;
    shortcutInApplicationShortcut: _ngrx_signals.DeepSignal<installer_core.ShortcutInApplicationShortcut>;
    update: (updates: Partial<InstallerProperties>) => void;
    getData: () => InstallerProperties;
} & _ngrx_signals.StateSource<{
    installationLocation: string;
    productName: string;
    icon: string;
    productVersion: string;
    publisher: string;
    supportLink: string;
    supportEmail: string;
    comment: string;
    launchFile: string;
    runAsAdmin: boolean;
    launchApp: boolean;
    shortcutInDesktop: installer_core.ShortcutInDesktop;
    shortcutInApplicationShortcut: installer_core.ShortcutInApplicationShortcut;
}>>;

declare const RegistryKeyStore: _angular_core.Type<{
    configRegistry: _ngrx_signals.DeepSignal<RegistryKey>;
    uninstallRegistry: _ngrx_signals.DeepSignal<RegistryKey>;
    updateRegistry: (update: RegistryKeys) => void;
    getData: () => RegistryKeys;
    addValue: (key: keyof RegistryKeys, value: RegistryValue) => void;
    updateValue: (key: keyof RegistryKeys, valueName: string, update: Partial<RegistryValue>) => void;
    removeValue: (key: keyof RegistryKeys, valueName: string) => void;
    upsertValue: (key: keyof RegistryKeys, value: RegistryValue) => void;
} & _ngrx_signals.StateSource<{
    configRegistry: RegistryKey;
    uninstallRegistry: RegistryKey;
}>>;

declare const WindowInfoStore: _angular_core.Type<{
    title: _angular_core.Signal<string>;
    width: _angular_core.Signal<number>;
    height: _angular_core.Signal<number>;
    startPage: _angular_core.Signal<string>;
    alwaysOnTop: _angular_core.Signal<boolean>;
    getData: () => WindowInfo;
    updateValue: (value: Partial<WindowInfo>) => void;
} & _ngrx_signals.StateSource<{
    title: string;
    width: number;
    height: number;
    startPage: string;
    alwaysOnTop: boolean;
}>>;

export { InstallerPropertyStore, RegistryKeyStore, RegistryValueType, WindowInfoStore };
export type { InstallerProperties, RegistryKey, RegistryKeys, RegistryValue, ShortcutInApplicationShortcut, ShortcutInDesktop, WindowInfo };
