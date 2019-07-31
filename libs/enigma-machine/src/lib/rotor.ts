import {
  Letter,
  isAlphabetValid,
  Alphabet,
  InvalidAlphabet,
  getLetterIndexInAlphabet,
  ALPHABET,
  getNextLetter
} from './alphabet';
import { Nil } from './utils/common-types';

export class InvalidRingPosition extends Error {
  constructor(position: Letter | Nil) {
    super(
      !position
        ? `Rotor's position hasn't been defined`
        : `Rotor's position "${position}" isn't valid. it should be a letter from the alphabet`
    );
  }
}

export type RotorLeftLetterMappedToRightIndex = { [key in Letter]: number };

export interface RotorRightIndexMappedToLeftLetter {
  [key: number]: Letter;
}

export type RotorsConfiguration = [Letter, Letter, Letter];

// within this model, the input is on the left
// and the reflector is on the right
export interface AlphabetLeftAndRightMap {
  leftToRight: RotorLeftLetterMappedToRightIndex;
  rightToLeft: RotorRightIndexMappedToLeftLetter;
}

export const mapScrambledAlphabetToRotorIndexOutput = (
  scrambledAlphabet: Alphabet
): AlphabetLeftAndRightMap => {
  if (!isAlphabetValid(scrambledAlphabet)) {
    throw new InvalidAlphabet();
  }

  return scrambledAlphabet.reduce(
    (map: AlphabetLeftAndRightMap, letter: Letter, index: number) => {
      const letterIndex = getLetterIndexInAlphabet(letter);
      map.leftToRight[ALPHABET[index]] = letterIndex;
      map.rightToLeft[letterIndex] = ALPHABET[index];

      return map;
    },
    { leftToRight: {}, rightToLeft: {} } as AlphabetLeftAndRightMap
  );
};

export const goToNextRotorCombination = (rotors: Letter[]): Letter[] => {
  if (!rotors) {
    return [];
  }

  if (rotors.every(r => r === Letter.Z)) {
    return rotors.map(r => Letter.A);
  }

  const [firstRotor, ...remainingRotors] = rotors;

  if (firstRotor === Letter.Z) {
    return [Letter.A, ...goToNextRotorCombination(remainingRotors)];
  }

  return [getNextLetter(firstRotor), ...remainingRotors];
};

export const relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex = (
  currentRingPosition: Letter,
  absoluteIndex: number
): number => {
  const indexInputLetter: number = getLetterIndexInAlphabet(
    currentRingPosition
  );

  if (indexInputLetter === absoluteIndex) {
    return 0;
  }

  if (absoluteIndex > indexInputLetter) {
    return absoluteIndex - indexInputLetter;
  }

  return 26 - (indexInputLetter - absoluteIndex);
};
