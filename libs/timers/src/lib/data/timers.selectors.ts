import { Timer } from './timer.interface';

export const getOppositeStatus = (status: Timer.Status): Timer.Status =>
  status === Timer.Status.STARTER ? Timer.Status.STOPPED : Timer.Status.STARTER;

export const getTimersWithSumTimes = (timers: Timer.AsObject[]): Timer.AsObjectResolved[] =>
  timers.map(timer => {
    const currentStatus: Timer.Status =
      timer.statusUpdatesAt.length % 2 === 0 ? timer.startedWithStatus : getOppositeStatus(timer.startedWithStatus);

    const timeElapsedWhileStartedMs: number = timer.statusUpdatesAt.reduce(
      (acc, update) => {
        if (acc.previousStatus === Timer.Status.STARTER) {
          return {
            previousTime: update,
            previousStatus: Timer.Status.STOPPED,
            accumulatedTime: acc.accumulatedTime + (update - acc.previousTime),
          };
        } else {
          return {
            ...acc,
            previousTime: update,
            previousStatus: Timer.Status.STARTER,
          };
        }
      },
      {
        previousTime: timer.startedAtMs,
        previousStatus: timer.startedWithStatus,
        accumulatedTime: 0,
      },
    ).accumulatedTime;

    return {
      ...timer,
      currentStatus,
      timeElapsedWhileStartedMs,
    };
  });
