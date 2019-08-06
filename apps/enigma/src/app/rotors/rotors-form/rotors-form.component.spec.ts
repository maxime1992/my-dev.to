import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RotorsFormComponent } from './rotors-form.component';

describe('RotorsFormComponent', () => {
  let component: RotorsFormComponent;
  let fixture: ComponentFixture<RotorsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RotorsFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotorsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
