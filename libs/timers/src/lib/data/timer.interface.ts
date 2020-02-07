export namespace Timer {
  export enum Status {
    STARTER = 'Started',
    STOPPED = 'Stopped',
  }

  export interface AsObject {
    id: string;
    startedAtMs: number;
    startedWithStatus: Timer.Status;
    statusUpdatesAt: number[];
  }

  export interface AsObjectResolved extends Timer.AsObject {
    currentStatus: Timer.Status;
    timeElapsedWhileStartedMs: number;
  }

  // only used in the view
  export interface TimerTimeElapsed extends Timer.AsObject {
    timeElapsedMs: number;
  }

  export namespace Actions {
    export type OneOf = Add | Remove | Toggle;

    export enum Types {
      ADD = 'Add',
      REMOVE = 'Remove',
      TOGGLE = 'Toggle',
    }

    export interface Add {
      type: Timer.Actions.Types.ADD;
      payload: {
        id: string;
        startedAtMs: number;
        startedWithStatus: Timer.Status;
      };
    }

    export interface Remove {
      type: Timer.Actions.Types.REMOVE;
      payload: {
        id: string;
      };
    }

    export interface Toggle {
      type: Timer.Actions.Types.TOGGLE;
      payload: {
        id: string;
        toggleAtMs: number;
      };
    }
  }
}
