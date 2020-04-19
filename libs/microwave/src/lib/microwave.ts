import { chunk } from '@common/object-utility';
import { UnreachableCase, unreachableCaseWrap } from '@common/type-utility';
import { ConnectableObservable, Observable, of, timer, Timestamp } from 'rxjs';
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
import { EMicrowaveAction, MicrowaveAction } from './microwave.actions';

const computeTimeDoneMs = (onAndOffTimes: number[]) =>
  chunk(onAndOffTimes).reduce((timeElapsed, [on, off]) => timeElapsed + off - on, 0);

export enum MicrowaveStatus {
  STARTED = 'Started',
  STOPPED = 'Stopped',
  RESET = 'Reset',
}

// nternal state to the reducer
interface MicrowaveInternalState {
  timePlannedMs: number;
  onAndOffTimes: number[];
  status: MicrowaveStatus;
}

// exposed/computed state
export interface MicrowaveState {
  timePlannedMs: number;
  timeDoneMs: number;
  status: MicrowaveStatus;
}

const INITIAL_MICROWAVE_STATE: MicrowaveInternalState = {
  timePlannedMs: 0,
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
  cleanUp: () => void;
}

const microwaveReducer = (
  microwave: MicrowaveInternalState,
  { value: action, timestamp }: Timestamp<MicrowaveAction>,
): MicrowaveInternalState => {
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
        onAndOffTimes:
          microwave.status !== MicrowaveStatus.STARTED
            ? microwave.onAndOffTimes
            : [...microwave.onAndOffTimes, timestamp],
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
};

const microwaveSelector = (microwave: MicrowaveInternalState): MicrowaveState => {
  switch (microwave.status) {
    case MicrowaveStatus.RESET:
      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.RESET,
        timeDoneMs: 0,
      };

    case MicrowaveStatus.STOPPED: {
      const timeDoneMs = computeTimeDoneMs(microwave.onAndOffTimes);

      if (microwave.timePlannedMs === 0 || microwave.timePlannedMs - timeDoneMs <= 0) {
        return {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        };
      }

      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.STOPPED,
        timeDoneMs: timeDoneMs,
      };
    }

    case MicrowaveStatus.STARTED:
      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.STARTED,
        timeDoneMs: computeTimeDoneMs(microwave.onAndOffTimes),
      };

    default:
      throw new UnreachableCase(microwave.status);
  }
};

export const createMicrowave = (action$: Observable<MicrowaveAction>): Microwave => {
  const microwaveState$: ConnectableObservable<MicrowaveInternalState> = action$.pipe(
    rxjsTimestamp(),
    scan(microwaveReducer, INITIAL_MICROWAVE_STATE),
    startWith(INITIAL_MICROWAVE_STATE),
    publishReplay(1),
  ) as ConnectableObservable<MicrowaveInternalState>;

  const microwave$: Observable<MicrowaveState> = microwaveState$.pipe(
    switchMap(microwave => {
      switch (microwave.status) {
        case MicrowaveStatus.RESET:
        case MicrowaveStatus.STOPPED:
          return of(microwaveSelector(microwave));

        case MicrowaveStatus.STARTED:
          return timer(0, 1000).pipe(
            rxjsTimestamp(),
            map(({ timestamp }) =>
              microwaveSelector({
                ...microwave,
                onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
              }),
            ),
            takeWhile(x => x.timeDoneMs < x.timePlannedMs),
            endWith(MICROWAVE_RESET_STATE),
          );

        default:
          throw new UnreachableCase(microwave.status);
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
    cleanUp: () => {
      microwaveStateSubscription.unsubscribe();
    },
  };
};
