import { NavigationExtras } from '@angular/router';
import { createAction, props } from '@ngrx/store';

export interface GoActionPayload {
  path: any[];
  query?: object;
  extras?: NavigationExtras;
}

export const routerGo = createAction('[Ngrx router] Go', props<GoActionPayload>());

export const routerBack = createAction('[Ngrx router] Back');
export const routerForward = createAction('[Ngrx router] Forward');
