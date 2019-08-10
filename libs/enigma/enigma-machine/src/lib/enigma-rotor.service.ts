import {
  ALPHABET,
  InvalidAlphabet,
  isStringCompleteUnorderedAlphabet,
  LetterIndex
} from '@enigma/enigma-utility';
import { BiMap, createBiMapFromAlphabet, InvalidRingPosition } from './rotor';

// in this file we cannot use anything related to angular
// otherwise the AoT compilation will fail because it's also
// used in the web worker context

export class EnigmaRotorService {
  public static ROTOR_1 = 'ekmflgdqvzntowyhxuspaibrcj';
  public static ROTOR_2 = 'ajdksiruxblhwtmcqgznpyfvoe';
  public static ROTOR_3 = 'fvpjiaoyedrzxwgctkuqsbnmhl';

  private rotor: BiMap;
  private currentRingPosition = 0;

  constructor(
    rotorConfig: string,
    currentRingPosition: number = LetterIndex.A
  ) {
    const rotorConfigSplit: string[] = rotorConfig.split('');

    if (!isStringCompleteUnorderedAlphabet(rotorConfigSplit)) {
      throw new InvalidAlphabet();
    }

    this.rotor = createBiMapFromAlphabet(rotorConfigSplit);

    this.setCurrentRingPosition(currentRingPosition);
  }

  public setCurrentRingPosition(ringPosition: number): void {
    if (ringPosition < LetterIndex.A || ringPosition > LetterIndex.Z) {
      throw new InvalidRingPosition(ringPosition);
    }

    this.currentRingPosition = ringPosition;
  }

  public getCurrentRingPosition(): number {
    return this.currentRingPosition;
  }

  private goThroughRotor(
    from: 'left' | 'right',
    relativeIndexInput: number
  ): number {
    const currentRelativeIndexOutput = this.rotor[
      from === 'left' ? 'leftToRight' : 'rightToLeft'
    ][(this.currentRingPosition + relativeIndexInput) % ALPHABET.length];

    return (relativeIndexInput + currentRelativeIndexOutput) % ALPHABET.length;
  }

  public goThroughRotorLeftToRight(relativeIndexInput: number): number {
    return this.goThroughRotor('left', relativeIndexInput);
  }

  public goThroughRotorRightToLeft(relativeIndexInput: number): number {
    return this.goThroughRotor('right', relativeIndexInput);
  }
}
