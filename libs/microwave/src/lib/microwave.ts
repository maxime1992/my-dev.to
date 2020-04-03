import { chunk } from '@common/object-utility';
import { UnreachableCase, unreachableCaseWrap } from '@common/type-utility';
import { ConnectableObservable, Observable, of, Subject, timer, Timestamp } from 'rxjs';
import {
  endWith,
  map,
  publishReplay,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeWhile,
  timestamp as rxjsTimestamp,
} from 'rxjs/operators';
import { Actions, EMicrowaveAction, MicrowaveAction } from './microwave.actions';

const computeTimeDoneMs = (onAndOffTimes: number[]) =>
  chunk(onAndOffTimes).reduce((timeElapsed, [on, off]) => timeElapsed + off - on, 0);

export enum MicrowaveStatus {
  STARTED = 'Started',
  STOPPED = 'Stopped',
  RESET = 'Reset',
}

// state internal to the reducer
interface MicrowaveInternalState {
  timePlannedMs: number;
  onAndOffTimes: number[];
  status: MicrowaveStatus;
}

// exposed/computed state
interface MicrowaveState {
  timePlannedMs: number;
  timeDoneMs: number;
  status: MicrowaveStatus;
}

const INITIAL_MICROWAVE_STATE: MicrowaveInternalState = {
  timePlannedMs: 10000,
  onAndOffTimes: [],
  status: MicrowaveStatus.RESET,
};

const MICROWAVE_RESET_STATE: MicrowaveState = {
  timePlannedMs: 0,
  status: MicrowaveStatus.RESET,
  timeDoneMs: 0,
};

export interface Microwave {
  microwave$: Observable<MicrowaveState>;
  actions$: Subject<MicrowaveAction>;
  cleanUp: () => void;
}

export const createMicrowave = (): Microwave => {
  const actions$: Subject<MicrowaveAction> = new Subject();

  const microwaveState$: ConnectableObservable<MicrowaveInternalState> = actions$.pipe(
    startWith(Actions.reset()),
    rxjsTimestamp(),
    scan<Timestamp<MicrowaveAction>, MicrowaveInternalState>((microwave, { value: action, timestamp }) => {
      switch (action.type) {
        case EMicrowaveAction.START:
          return {
            ...microwave,
            status: MicrowaveStatus.STARTED,
            onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
          };
        case EMicrowaveAction.STOP:
          return {
            ...microwave,
            status: MicrowaveStatus.STOPPED,
            onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
          };
        case EMicrowaveAction.RESET:
          return INITIAL_MICROWAVE_STATE;
        case EMicrowaveAction.ADD_TIME_MS: {
          return {
            ...microwave,
            timePlannedMs: microwave.timePlannedMs + action.payload.timeMs,
          };
        }
        default:
          unreachableCaseWrap(action);
      }

      return microwave;
    }, INITIAL_MICROWAVE_STATE),
    publishReplay(1),
  ) as ConnectableObservable<MicrowaveInternalState>;

  const microwave$: Observable<MicrowaveState> = microwaveState$.pipe(
    switchMap(microwave => {
      const status: MicrowaveStatus = microwave.status;

      switch (status) {
        case MicrowaveStatus.RESET:
          return of(MICROWAVE_RESET_STATE);

        case MicrowaveStatus.STOPPED: {
          return of({
            timePlannedMs: microwave.timePlannedMs,
            status: MicrowaveStatus.STOPPED,
            timeDoneMs: computeTimeDoneMs(microwave.onAndOffTimes),
          });
        }

        case MicrowaveStatus.STARTED:
          // tslint:disable-next-line: no-magic-numbers
          return timer(0, 1000).pipe(
            rxjsTimestamp(),
            map(({ timestamp }) => ({
              timePlannedMs: microwave.timePlannedMs,
              status: MicrowaveStatus.STARTED,
              timeDoneMs: computeTimeDoneMs([...microwave.onAndOffTimes, timestamp]),
            })),
            takeWhile(x => x.timeDoneMs < x.timePlannedMs),
            endWith(MICROWAVE_RESET_STATE),
          );

        default:
          throw new UnreachableCase(status);
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // we need to keep the state subscribed as if no one is listening
  // to it we should still be able to take actions into account
  // note: we don't unnecessarily subscribe to `microwave$` as this
  // does some computation derived from the state so if someone subscribes
  // later on, that stream would still be up to date!
  const microwaveStateSubscription = microwaveState$.connect();

  return {
    microwave$,
    actions$,
    cleanUp: () => {
      microwaveStateSubscription.unsubscribe();
    },
  };
};
