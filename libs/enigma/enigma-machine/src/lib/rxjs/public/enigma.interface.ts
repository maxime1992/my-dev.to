export namespace Enigma {
  export type Letter = string;
  export type Alphabet = string;

  export interface Rotor {
    readonly id: string;
    // a scrambled alphabet
    readonly alphabetRemap: Alphabet;
  }

  export interface RotorsInitialConfig {
    readonly [rotorId: string]: Letter;
  }

  export interface Reflector {
    readonly id: string;
    // a scrambled alphabet
    readonly alphabetRemap: Alphabet;
  }

  export interface InOut {
    readonly in: number;
    readonly out: number;
  }

  export interface EnigmaIntermediaryResult {
    readonly inputLetter: string;
    readonly outputLetter: string;
    readonly goingThroughRotorsLeftToRight: InOut[];
    readonly goingThroughReflector: InOut;
    readonly goingThroughRotorsRightToLeft: InOut[];
  }

  export interface EnigmaResult {
    readonly intermediaryResults: EnigmaIntermediaryResult[];
    readonly inputMessage: string;
    readonly outputMessage: string;
  }
}
