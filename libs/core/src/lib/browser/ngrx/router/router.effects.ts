import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { routerBack, routerForward, routerGo } from './router.actions';

@Injectable()
export class RouterEffects {
  public navigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(routerGo),
        tap(({ path, query: queryParams, extras }) => this.router.navigate(path, { queryParams, ...extras })),
      ),
    { dispatch: false },
  );

  public navigateBack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(routerBack),
        tap(() => this.location.back()),
      ),
    { dispatch: false },
  );

  public navigateForward$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(routerForward),
        tap(() => this.location.forward()),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private router: Router, private location: Location) {}
}
