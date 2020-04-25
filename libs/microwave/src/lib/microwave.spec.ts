import { Observable } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { createMicrowave, Microwave, MicrowaveState, MicrowaveStatus } from './microwave';
import { EMicrowaveAction, MicrowaveAction, OneOfMicrowaveAction } from './microwave.actions';

describe(`Microwave`, () => {
  let testScheduler: TestScheduler;
  let microwave$: Observable<MicrowaveState>;
  let microwaveCleanUp: Microwave['cleanUp'];

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  const setup = (microWaveActions: Observable<OneOfMicrowaveAction>) => {
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
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
      });
    });
  });

  it(`should emit the reset status if we try to start without adding any time first`, () => {
    testScheduler.run(({ expectObservable, cold }) => {
      setup(cold('-a|', { a: MicrowaveAction.start() }));

      expectObservable(microwave$.pipe(take(2))).toBe('a(b|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        b: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
      });
    });
  });

  it(`should emit the started status and get the new elapsed time every seconds when we start and once the timer is over it should emit the reset status`, () => {
    testScheduler.run(({ expectObservable, cold }) => {
      setup(
        cold('-a-b|', {
          a: MicrowaveAction.addTime(3000),
          b: MicrowaveAction.start(),
        }),
      );

      expectObservable(microwave$.pipe(take(6))).toBe('ab-c 999ms d 999ms e 999ms (f|)', {
        a: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        b: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: true,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        c: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: true,
            [EMicrowaveAction.RESET]: true,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        d: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 1000,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: true,
            [EMicrowaveAction.RESET]: true,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        e: {
          timePlannedMs: 3000,
          status: MicrowaveStatus.STARTED,
          timeDoneMs: 2000,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: true,
            [EMicrowaveAction.RESET]: true,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
        },
        f: {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
          availableActions: {
            [EMicrowaveAction.START]: false,
            [EMicrowaveAction.STOP]: false,
            [EMicrowaveAction.RESET]: false,
            [EMicrowaveAction.ADD_TIME_MS]: true,
          },
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
          setup(cold('-a|', { a: MicrowaveAction.addTime(3000) }));

          expectObservable(microwave$.pipe(take(2))).toBe('a(b|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: true,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
          });
        });
      }),
      [MicrowaveStatus.STARTED]: test(`status STARTED`, () => {
        testScheduler.run(({ expectObservable, cold }) => {
          // note: we have to add some time before being able to start (which makes sense...)
          setup(
            cold('-a-b-c|', {
              a: MicrowaveAction.addTime(3000),
              b: MicrowaveAction.start(),
              c: MicrowaveAction.addTime(3000),
            }),
          );

          expectObservable(microwave$.pipe(take(4))).toBe('ab-c-(d|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: true,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            c: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: true,
                [EMicrowaveAction.RESET]: true,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            d: {
              timePlannedMs: 6000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 2,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: true,
                [EMicrowaveAction.RESET]: true,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
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
              a: MicrowaveAction.addTime(3000),
              b: MicrowaveAction.start(),
              c: MicrowaveAction.stop(),
              d: MicrowaveAction.addTime(3000),
            }),
          );

          expectObservable(microwave$.pipe(take(5))).toBe('ab-c-d-(e|)', {
            a: {
              timePlannedMs: 0,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            b: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.RESET,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: true,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: false,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            c: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: 0,
              availableActions: {
                [EMicrowaveAction.START]: false,
                [EMicrowaveAction.STOP]: true,
                [EMicrowaveAction.RESET]: true,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            d: {
              timePlannedMs: 3000,
              status: MicrowaveStatus.STOPPED,
              timeDoneMs: 2,
              availableActions: {
                [EMicrowaveAction.START]: true,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: true,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
            e: {
              timePlannedMs: 6000,
              status: MicrowaveStatus.STOPPED,
              timeDoneMs: 2,
              availableActions: {
                [EMicrowaveAction.START]: true,
                [EMicrowaveAction.STOP]: false,
                [EMicrowaveAction.RESET]: true,
                [EMicrowaveAction.ADD_TIME_MS]: true,
              },
            },
          });
        });
      }),
    };
  });
});
