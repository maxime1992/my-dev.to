import { Player, PlayerID } from './time-s-up.interfaces';

export enum ETimeIsUpAction {
  SET_ADMIN = 'SetAdmin',
  ADD_PLAYER = 'AddPlayer',
  REMOVE_PLAYER = 'RemovePlayer',
  SET_WORDS_TO_FIND = 'SetWordsToFind',
}

export interface SetAdmin {
  type: ETimeIsUpAction.SET_ADMIN;
  payload: { admin: Player };
}

export interface AddPlayer {
  type: ETimeIsUpAction.ADD_PLAYER;
  payload: { player: Player };
}

export interface RemovePlayer {
  type: ETimeIsUpAction.REMOVE_PLAYER;
  payload: { playerId: PlayerID };
}

export interface SetWordsToFind {
  type: ETimeIsUpAction.SET_WORDS_TO_FIND;
  payload: { words: string[] };
}

export type OneOfTimeIsUpActions = SetAdmin | AddPlayer | RemovePlayer;

export namespace TimeIsUpAction {
  export const setAdmin = (admin: Player): SetAdmin => ({
    type: ETimeIsUpAction.SET_ADMIN,
    payload: { admin },
  });

  export const addPlayer = (player: Player): AddPlayer => ({
    type: ETimeIsUpAction.ADD_PLAYER,
    payload: { player },
  });

  export const removePlayer = (playerId: PlayerID): RemovePlayer => ({
    type: ETimeIsUpAction.REMOVE_PLAYER,
    payload: { playerId },
  });

  export const setWordsToFind = (words: string[]): SetWordsToFind => ({
    type: ETimeIsUpAction.SET_WORDS_TO_FIND,
    payload: { words },
  });
}
