import { unreachableCaseWrap } from '@common/type-utility';
import { ETimeIsUpAction, OneOfTimeIsUpActions } from './time-s-up.actions';
import { Player, Team, TimeIsUpGame } from './time-s-up.interfaces';

export const INITIAL_STATE_TIME_IS_UP_GAME: TimeIsUpGame = {
  admin: null,
  players: [],
  config: {
    teamSize: 2,
    teams: [],
    wordsToFind: [],
  },
};

export const timeIsUpReducer = (
  timeIsUpState: Readonly<TimeIsUpGame> = INITIAL_STATE_TIME_IS_UP_GAME,
  action: Readonly<OneOfTimeIsUpActions>,
): TimeIsUpGame => {
  switch (action.type) {
    case ETimeIsUpAction.SET_ADMIN: {
      return {
        ...timeIsUpState,
        admin: action.payload.admin,
      };
    }

    case ETimeIsUpAction.ADD_PLAYER: {
      return {
        ...timeIsUpState,
        players: [...timeIsUpState.players, action.payload.player],
      };
    }

    case ETimeIsUpAction.REMOVE_PLAYER: {
      const players: Player[] = timeIsUpState.players.filter(player => player.id !== action.payload.playerId);

      return {
        ...timeIsUpState,
        players,
        config:
          players.length === timeIsUpState.players.length
            ? timeIsUpState.config
            : {
                ...timeIsUpState.config,
                teams: timeIsUpState.config.teams.reduce<Team[]>((acc, team) => {
                  if (team.players.includes(action.payload.playerId)) {
                    acc.push({
                      ...team,
                      players: team.players.filter(playerId => playerId !== action.payload.playerId),
                    });
                  } else {
                    acc.push(team);
                  }

                  return acc;
                }, []),
              },
      };
    }

    default:
      unreachableCaseWrap(action);
  }

  return timeIsUpState;
};
