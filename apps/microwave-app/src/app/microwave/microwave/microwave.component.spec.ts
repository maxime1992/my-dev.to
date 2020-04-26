import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MicrowaveComponent } from './microwave.component';

describe('MicrowaveComponent', () => {
  let component: MicrowaveComponent;
  let fixture: ComponentFixture<MicrowaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MicrowaveComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrowaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
