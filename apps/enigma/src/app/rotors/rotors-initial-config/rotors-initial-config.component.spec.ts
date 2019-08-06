import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotorsInitialConfigComponent } from './rotors-initial-config.component';

describe('RotorsInitialConfigComponent', () => {
  let component: RotorsInitialConfigComponent;
  let fixture: ComponentFixture<RotorsInitialConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotorsInitialConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotorsInitialConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
