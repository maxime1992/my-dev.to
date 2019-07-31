import { InjectionToken, StaticProvider } from '@angular/core';
import { EnigmaRotorService } from './enigma-rotor.service';
import { Letter, stringToAlphabet, Alphabet } from './alphabet';
import { REFLECTOR } from './reflector';
import { mapScrambledAlphabetToRotorIndexOutput } from './rotor';

export class EnigmaMachineRequires3Rotors extends Error {
  message = `Enigma machine requires 3 rotors`;
}

export const ROTORS: InjectionToken<EnigmaRotorService[]> = new InjectionToken<
  EnigmaRotorService[]
>('EnigmaRotorServices');

export const DEFAULT_ENIGMA_MACHINE_PROVIDERS: StaticProvider[] = [
  ...[
    'ekmflgdqvzntowyhxuspaibrcj',
    'ajdksiruxblhwtmcqgznpyfvoe',
    'fvpjiaoyedrzxwgctkuqsbnmhl'
  ].map(rotorAlphabetOutput => ({
    provide: ROTORS,
    multi: true,
    useFactory: () =>
      new EnigmaRotorService(Letter.A, stringToAlphabet(rotorAlphabetOutput))
  })),
  {
    provide: REFLECTOR,
    // @todo simplify and move to utils file
    // @todo make sure that a letter doesn't map to itself
    useValue: mapScrambledAlphabetToRotorIndexOutput(
      'yruhqsldpxngokmiebfzcwvjat'.split('') as Alphabet
    ).leftToRight
  }
];
