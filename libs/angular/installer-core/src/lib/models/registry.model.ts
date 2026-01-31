export enum RegistryValueType {
    REG_NONE = 'REG_NONE',
    REG_SZ = 'REG_SZ',
    REG_EXPAND_SZ = 'REG_EXPAND_SZ',
    REG_DWORD = 'REG_DWORD',
    REG_QWORD = 'REG_QWORD',
    REG_BINARY = 'REG_BINARY',
    REG_MULTI_SZ = 'REG_MULTI_SZ',
}

export interface RegistryValue {
    name: string; // eg: "ProductName"
    type: RegistryValueType; // eg: RegistryValueType.SZ,
    data: string | number | string[] | null; // "Tun Installer"
}

export interface RegistryKey {
    name: string; // eg: "CurrentVersion"
    path: string; // eg: "HKEY_LOCAL_MACHINE\\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
    values: RegistryValue[];
}

export interface RegistryKeys {
    configRegistry: RegistryKey;
    uninstallRegistry: RegistryKey;
}
