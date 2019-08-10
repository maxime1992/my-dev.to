import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

export const select = <T, U>(mapCb: (state: T) => U) => (obs$: Observable<T>) =>
  obs$.pipe(
    map(mapCb),
    distinctUntilChanged()
  );

export const takeUntilDestroyed = <T>(component: OnDestroy) => (
  source: Observable<T>
): Observable<T> => {
  const onDestroy = new Subject();
  const previousOnDestroy = component.ngOnDestroy;

  component.ngOnDestroy = () => {
    if (previousOnDestroy) {
      previousOnDestroy.apply(component);
    }

    onDestroy.next();
    onDestroy.complete();
  };

  return source.pipe(takeUntil(onDestroy));
};
