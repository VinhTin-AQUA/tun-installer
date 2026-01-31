import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallerCore } from './installer-core';

describe('InstallerCore', () => {
    let component: InstallerCore;
    let fixture: ComponentFixture<InstallerCore>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InstallerCore],
        }).compileComponents();

        fixture = TestBed.createComponent(InstallerCore);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
