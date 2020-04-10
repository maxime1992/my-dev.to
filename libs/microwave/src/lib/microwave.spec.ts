import { Observable } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { createMicrowave, Microwave, MicrowaveState, MicrowaveStatus } from './microwave';
import { Actions, MicrowaveAction } from './microwave.actions';

describe(`Microwave`, () => {
  let testScheduler: TestScheduler;
  let microwave$: Observable<MicrowaveState>;
  let microwaveCleanUp: Microwave['cleanUp'];

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  const setup = (microWaveActions: Observable<MicrowaveAction>) => {
    const m = createMicrowave(microWaveActions);
    microwave$ = m.microwave$;
    microwaveCleanUp = m.cleanUp;
  };

  afterEach(() => {
    microwaveCleanUp();
  });

  it(`should start with the reset state`, () => {
    testScheduler.run(({ expectObservable, cold }) => {
      setup(cold('|'));

      expectObservable(microwave$.pipe(first())).toBe('(a|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
      });
    });
  });

  it(`should emit the reset status if we try to start without adding any time first`, () => {
    testScheduler.run(({ expectObservable, cold }) => {
      setup(cold('-a|', { a: Actions.start() }));

      expectObservable(microwave$.pipe(take(2))).toBe('a(b|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
        b: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
      });
    });
  });

  it(`should emit the started status and get the new elapsed time every seconds when we start and once the timer is over it should emit the reset status`, () => {
    testScheduler.run(({ expectObservable, cold }) => {
      setup(
        cold('-a-b|', {
          a: Actions.addTime(3000),
          b: Actions.start(),
        }),
      );

      expectObservable(microwave$.pipe(take(6))).toBe('ab-c 999ms d 999ms e 999ms (f|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
        b: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
        c: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 0,
        },
        d: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 1000,
        },
        e: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 2000,
        },
        f: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        },
      });
    });
  });

  describe(`when adding some time the current status shouldn't change, only the time planned should`, () => {
    // following variable is not used, it's here only for the type safety
    // as we want to test all the statuses we use record to not forget any
    // tslint:disable-next-line: no-unused-variable
    const tests: Record<MicrowaveStatus, any> = {
      [MicrowaveStatus.RESET]: test(`status RESET`, () => {
        testScheduler.run(({ expectObservable, cold }) => {
          // it already starts with the reset status
          setup(cold('-a|', { a: Actions.addTime(3000) }));

          expectObservable(microwave$.pipe(take(2))).toBe('a(b|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
          });
        });
      }),
      [MicrowaveStatus.STARTED]: test(`status STARTED`, () => {
        testScheduler.run(({ expectObservable, cold }) => {
          // note: we have to add some time before being able to start (which makes sense...)
          setup(cold('-a-b-c|', { a: Actions.addTime(3000), b: Actions.start(), c: Actions.addTime(3000) }));

          expectObservable(microwave$.pipe(take(4))).toBe('ab-c-(d|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
            c: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 0,
            },
            d: {
              timePlannedMs: 6000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 2,
            },
          });
        });
      }),
      [MicrowaveStatus.STOPPED]: test(`status STOPPED`, () => {
        testScheduler.run(({ expectObservable, cold }) => {
          // note: to have the status as stopped while updating the time
          // we have to start first otherwise a stopped status with time planned 0
          // would end up being RESET
          setup(
            cold('-a-b-c-d|', {
              a: Actions.addTime(3000),
              b: Actions.start(),
              c: Actions.stop(),
              d: Actions.addTime(3000),
            }),
          );

          expectObservable(microwave$.pipe(take(5))).toBe('ab-c-d-(e|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
            },
            c: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 0,
            },
            d: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STOPPED,
              timeDoneMs: 2,
            },
            e: {
              timePlannedMs: 6000,
              status: MicrowaveStatus.STOPPED,
              timeDoneMs: 2,
            },
          });
        });
      }),
    };
  });
});
