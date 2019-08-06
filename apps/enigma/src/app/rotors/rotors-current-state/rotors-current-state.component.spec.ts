import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotorsCurrentStateComponent } from './rotors-current-state.component';

describe('RotorsCurrentStateComponent', () => {
  let component: RotorsCurrentStateComponent;
  let fixture: ComponentFixture<RotorsCurrentStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotorsCurrentStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotorsCurrentStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
