import { async, TestBed } from '@angular/core/testing';
import { TimeSUpModule } from './time-s-up.module';

describe('TimeSUpModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimeSUpModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TimeSUpModule).toBeDefined();
  });
});
