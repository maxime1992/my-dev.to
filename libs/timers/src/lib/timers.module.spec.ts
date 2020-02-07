import { async, TestBed } from '@angular/core/testing';
import { TimersModule } from './timers.module';

describe('TimersModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimersModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TimersModule).toBeDefined();
  });
});
