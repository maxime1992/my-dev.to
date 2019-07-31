import { InjectionToken } from '@angular/core';
import { RotorLeftLetterMappedToRightIndex } from './rotor';

// enigma 1 had 2 reflectors:
// "Wide B": yruhqsldpxngokmiebfzcwvjat
// "Wide C": fvpjiaoyedrzxwgctkuqsbnmhl
// here we're only going to use "Wide B"
export const REFLECTOR: InjectionToken<
  RotorLeftLetterMappedToRightIndex
> = new InjectionToken<RotorLeftLetterMappedToRightIndex>('ReflectorWideB');

export class ReflectorRequiresValidAlphabet extends Error {
  message = `A reflector should contains the whole alphabet in any order. Nothing more, nothing less`;
}
