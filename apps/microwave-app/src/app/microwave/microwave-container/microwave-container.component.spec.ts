import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MicrowaveComponent } from '../microwave/microwave.component';
import { MicrowaveContainerComponent } from './microwave-container.component';

describe('MicrowaveContainerComponent', () => {
  let component: MicrowaveContainerComponent;
  let fixture: ComponentFixture<MicrowaveContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MicrowaveContainerComponent, MicrowaveComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrowaveContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
