export enum EMicrowaveAction {
  START = 'Start',
  STOP = 'Stop',
  RESET = 'Reset',
  ADD_TIME_MS = 'AddTimeMs',
}

export interface StartAction {
  type: EMicrowaveAction.START;
}

export interface StopAction {
  type: EMicrowaveAction.STOP;
}

export interface ResetAction {
  type: EMicrowaveAction.RESET;
}

export interface AddTimeAction {
  type: EMicrowaveAction.ADD_TIME_MS;
  payload: { timeMs: number };
}

export type MicrowaveAction = StartAction | StopAction | ResetAction | AddTimeAction;

export namespace Actions {
  export const start = (): StartAction => ({
    type: EMicrowaveAction.START,
  });

  export const stop = (): StopAction => ({
    type: EMicrowaveAction.STOP,
  });

  export const reset = (): ResetAction => ({
    type: EMicrowaveAction.RESET,
  });

  export const addTime = (timeMs: number): AddTimeAction => ({
    type: EMicrowaveAction.ADD_TIME_MS,
    payload: { timeMs },
  });
}
