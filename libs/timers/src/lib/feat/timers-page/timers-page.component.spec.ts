import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIcon, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';
import { TimerComponent } from '../../ui/timer/timer.component';
import { TimersPageComponent } from './timers-page.component';

describe('TimersPageComponent', () => {
  let component: TimersPageComponent;
  let fixture: ComponentFixture<TimersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ReactiveFormsModule, MatButtonModule, MatInputModule],
      declarations: [TimersPageComponent, TimerComponent, MockComponent(MatIcon)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
