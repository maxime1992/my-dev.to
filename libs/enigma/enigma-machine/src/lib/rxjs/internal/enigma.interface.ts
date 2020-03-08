import { NullableProps } from '@common/type-utility';
import { Enigma } from '../public/enigma.interface';

export namespace EnigmaInternal {
  export interface BiMap {
    readonly leftToRight: number[];
    readonly rightToLeft: number[];
  }

  export interface BiMapRotor {
    readonly id: string;
    readonly wires: BiMap;
  }

  export interface Reflector {
    readonly id: string;
    readonly wires: number[];
  }

  export interface CurrentRotorsPositions {
    readonly [rotorId: string]: number;
  }

  export interface EnigmaState {
    readonly rotors: BiMapRotor[];
    readonly reflector: Reflector;
    readonly currentRotorsPositions: CurrentRotorsPositions;
  }

  export interface EnigmaStateAndResults {
    readonly state: EnigmaState;
    readonly results: Enigma.EnigmaIntermediaryResult[];
  }

  export interface LastIndexAndEnigma {
    readonly enigma: EnigmaStateAndResults;
    readonly lastIndex: number;
  }
}
