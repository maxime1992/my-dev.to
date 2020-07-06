import { Injectable } from '@angular/core';
import { routerGo } from '@maxime1992/core-browser';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { joinExistingGame } from './main.actions';

@Injectable()
export class MainEffects {
  public joinExistingGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(joinExistingGame),
      map(({ id }) => routerGo({ path: ['/game', id] })),
    ),
  );

  constructor(private actions$: Actions) {}
}
