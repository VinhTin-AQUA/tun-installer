import { Component } from '@angular/core';
import { RegistryEntry } from './models/registry-entry';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-registry',
    imports: [FormsModule],
    templateUrl: './registry.html',
    styleUrl: './registry.css',
})
export class Registry {
    configRegistry = 'Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE'; // + publisher\\appName
    uninstallRegistry =
        'Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall'; //  + publisher\\appName

    // Mảng mặc định
    configRegistryEntries: RegistryEntry[] = [
        { name: 'PostgreSQL', type: 'String', data: '17.5-3' },
        { name: 'MyApp', type: 'DWORD', data: '1' },
    ];

    uninstallRegistryEntries: RegistryEntry[] = [
        { name: 'PostgreSQL 17', type: 'String', data: 'C:\\Program Files\\PostgreSQL\\17' },
        { name: 'MyApp', type: 'String', data: 'C:\\Program Files\\MyApp' },
    ];

    // Gợi ý mặc định
    nameSuggestions = ['PostgreSQL', 'MyApp', 'NodeJS', 'Python'];
    typeOptions = ['String', 'DWORD', 'QWORD', 'Binary'];
    dataSuggestions = ['1', '0', 'C:\\Program Files\\', '17.5-3'];

    // Thêm giá trị mới
    addConfigEntry() {
        this.configRegistryEntries.push({ name: '', type: 'String', data: '' });
    }

    addUninstallEntry() {
        this.uninstallRegistryEntries.push({ name: '', type: 'String', data: '' });
    }
}
