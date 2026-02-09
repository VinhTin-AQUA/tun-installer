import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tauri } from './tauri';

describe('Tauri', () => {
  let component: Tauri;
  let fixture: ComponentFixture<Tauri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tauri]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tauri);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
