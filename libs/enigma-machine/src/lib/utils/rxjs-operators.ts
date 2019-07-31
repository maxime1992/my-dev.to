import { Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

export const select = <T, U>(mapCb: (state: T) => U) => (obs$: Observable<T>) =>
  obs$.pipe(
    map(mapCb),
    distinctUntilChanged()
  );

export function takeUntilDestroyed<T>(
  component: OnDestroy
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> => {
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
}
