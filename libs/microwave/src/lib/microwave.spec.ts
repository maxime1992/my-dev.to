import { first } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { createMicrowave, Microwave, MicrowaveStatus } from './microwave';

describe(`Microwave`, () => {
  let testScheduler: TestScheduler;
  let microwave: Microwave;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    microwave = createMicrowave();
  });

  afterEach(() => {
    microwave.cleanUp();
  });

  it(`Should start with the reset state`, () => {
    testScheduler.run(({ expectObservable }) =>
      expectObservable(microwave.microwave$.pipe(first())).toBe('(a|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
      }),
    );
  });
});
