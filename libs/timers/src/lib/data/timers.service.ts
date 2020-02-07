import { Injectable } from '@angular/core';
import { ConnectableObservable, Observable, of, Subject, timer as rxjsTimer } from 'rxjs';
import {
  map,
  publishReplay,
  scan,
  shareReplay,
  startWith,
  switchMap,
  timestamp as rxjsTimestamp,
} from 'rxjs/operators';
import { Timer } from './timer.interface';
import { getTimersWithSumTimes } from './timers.selectors';

interface TimersState {
  ids: string[];
  entities: { [id: string]: Timer.AsObject };
}

const initialTimersState: TimersState = {
  ids: [],
  entities: {},
};

const timersReducer = (timersState: TimersState = initialTimersState, action: Timer.Actions.OneOf): TimersState => {
  switch (action.type) {
    case Timer.Actions.Types.ADD: {
      return {
        ...timersState,
        ids: [action.payload.id, ...timersState.ids],
        entities: {
          ...timersState.entities,
          [action.payload.id]: {
            ...action.payload,
            statusUpdatesAt: [],
          },
        },
      };
    }

    case Timer.Actions.Types.REMOVE: {
      const entitiesCopy = { ...timersState.entities };
      delete entitiesCopy[action.payload.id];
      return {
        ...timersState,
        ids: timersState.ids.filter(id => id !== action.payload.id),
        entities: entitiesCopy,
      };
    }
    case Timer.Actions.Types.TOGGLE: {
      const currentTimer: Timer.AsObject = timersState.entities[action.payload.id];

      return {
        ...timersState,
        entities: {
          ...timersState.entities,
          [action.payload.id]: {
            ...currentTimer,
            statusUpdatesAt: [...currentTimer.statusUpdatesAt, action.payload.toggleAtMs],
          },
        },
      };
    }
  }

  return timersState;
};

@Injectable({ providedIn: 'root' })
export class TimersService {
  private actions$: Subject<Timer.Actions.OneOf> = new Subject();

  private timersState$: ConnectableObservable<TimersState> = this.actions$.pipe(
    scan(timersReducer, initialTimersState),
    startWith(initialTimersState),
    publishReplay(1),
  ) as ConnectableObservable<TimersState>;

  public timers$: Observable<Timer.AsObject[]> = this.timersState$.pipe(
    map(state => state.ids.map(id => state.entities[id])),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public getTimersWithTimeElapsed(updateInterval: Observable<number>): Observable<Timer.TimerTimeElapsed[]> {
    return this.timers$.pipe(
      map(getTimersWithSumTimes),
      switchMap(timers =>
        !timers.length
          ? of([])
          : updateInterval.pipe(
              switchMap(timerInterval =>
                !timers.length
                  ? of([])
                  : rxjsTimer(0, timerInterval).pipe(
                      rxjsTimestamp(),
                      map(t => t.timestamp),
                      map(timestamp =>
                        timers.map(timer => ({
                          ...timer,
                          timeElapsedMs:
                            timer.currentStatus === Timer.Status.STARTER
                              ? timestamp -
                                (timer.statusUpdatesAt[timer.statusUpdatesAt.length - 1] || timer.startedAtMs) +
                                timer.timeElapsedWhileStartedMs
                              : timer.timeElapsedWhileStartedMs,
                        })),
                      ),
                    ),
              ),
            ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  constructor() {
    // keep the subscription of the timers alive
    // whether someone's listening to the observable or not
    // because the view shouldn't be in charge of keeping
    // the subscription to our "store"
    this.timersState$.connect();
  }

  // actions
  public add(payload: Timer.Actions.Add['payload']) {
    this.actions$.next({
      type: Timer.Actions.Types.ADD,
      payload,
    });
  }

  public remove(payload: Timer.Actions.Remove['payload']) {
    this.actions$.next({
      type: Timer.Actions.Types.REMOVE,
      payload,
    });
  }

  public toggle(payload: Timer.Actions.Toggle['payload']) {
    this.actions$.next({
      type: Timer.Actions.Types.TOGGLE,
      payload,
    });
  }
}
