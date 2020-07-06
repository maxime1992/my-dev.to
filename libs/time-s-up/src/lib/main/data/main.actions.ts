import { createAction, props } from '@ngrx/store';

export const joinExistingGame = createAction('[Main] Join existing game', props<{ id: string }>());
