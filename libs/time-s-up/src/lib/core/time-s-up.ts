import { ConnectableObservable, Observable } from 'rxjs';
import { publishReplay, scan } from 'rxjs/operators';
import { OneOfTimeIsUpActions } from './time-s-up.actions';
import { TimeIsUpGame, TimeIsUpGameBundle } from './time-s-up.interfaces';
import { INITIAL_STATE_TIME_IS_UP_GAME, timeIsUpReducer } from './time-s-up.reducer';

export const createTimeIsUpGame = (action$: Observable<OneOfTimeIsUpActions>): TimeIsUpGameBundle => {
  const timeIsUpGameState$: ConnectableObservable<TimeIsUpGame> = action$.pipe(
    scan(timeIsUpReducer, INITIAL_STATE_TIME_IS_UP_GAME),
    publishReplay(1),
  ) as ConnectableObservable<TimeIsUpGame>;

  // we need to connect here to make sure that if an action
  // is dispatched before we actually subscribe to the state
  // it should still be taken into account
  const sub = timeIsUpGameState$.connect();

  const timeIsUpGame$: Observable<TimeIsUpGame> = timeIsUpGameState$.pipe();

  return {
    timeIsUpGame$,
    cleanup: () => {
      sub.unsubscribe();
    },
  };
};
