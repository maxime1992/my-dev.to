import { Observable } from 'rxjs';

export type PlayerID = string;

export interface Player {
  id: PlayerID;
  nickname: string;
}

// interface ConnectedPlayer extends Player {
//   token: string;
// }

export interface Team {
  name: string;
  players: PlayerID[];
}

interface Config {
  teamSize: number;
  teams: Team[];
  wordsToFind: string[];
}

export interface TimeIsUpGame {
  admin: Player | null;
  players: Player[];
  config: Config;
}

export interface TimeIsUpGameBundle {
  timeIsUpGame$: Observable<TimeIsUpGame>;
  cleanup: () => void;
}
