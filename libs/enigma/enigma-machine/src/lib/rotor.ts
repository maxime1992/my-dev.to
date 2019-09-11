import { Nil } from '@common/type-utility';
import { Alphabet, ALPHABET, getLetterIndexInAlphabet, Letter, LetterIndex } from '@enigma/enigma-utility';

export class InvalidRingPosition extends Error {
  constructor(position: number | Nil) {
    super(
      !position
        ? `Rotor's position hasn't been defined`
        : `Rotor's position "${position}" isn't valid. it should be a number between 0 (A) and 25 (Z)`,
    );
  }
}

// enigma 1 only had 3 rotors
// 5 were available in total but only 3 could be used in the machine
export type RotorsStateInternalApi = [number, number, number];
export type RotorsState = [Letter, Letter, Letter];

// here's a visual help to understand the "left/right"
// model we will be using:
// |--------|-------------------------------------------|---------|
// |        |  keyboard --> R1 --> R2 --> R3 --> |      |         |
// |  LEFT  |                                Reflector  |  RIGHT  |
// |        |  display  <-- R1 <-- R2 <-- R3 <-- |      |         |
// |--------|-------------------------------------------|---------|
export interface BiMap {
  leftToRight: number[];
  rightToLeft: number[];
}

const moduloWithPositiveOrNegative = (base: number, number: number) => (number > 0 ? number : base + number);

// a rotor is described like the following:
// ekmflgdqvzntowyhxuspaibrcj
// it contains all (and only) the 26 letters of the alphabet
// with our model, we need to remap those letters to relative
// indexes for e.g. in that case we've got
// a  b  c  d  e  f  g  h  i  j  k  l  m  n  o  p  q  r  s  t  u  v  w  x  y  z   Alphabet...
// |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |   is remapped to...
// e  k  m  f  l  g  d  q  v  z  n  t  o  w  y  h  x  u  s  p  a  i  b  r  c  j   a new alphabet
//
// what it really means is that a letter at a given index remap to another index
// as a rotor turns, we need to keep in mind that those indexes are relative
// so we remap the alphabet above to relative indexes:
// 0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25
// |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
// +4  +9  +10 +2  +7  +1  +23 +9  +13 +16 +3  +8  +2  +9  +10 +18 +7  +3  +26 +22 +6  +13 +5  +20 +4  +10
//
// the function is returning a BiMap because we want the relative indexes in both cases:
// from left to right and right to left for when the letter is coming back through the rotors
export const createBiMapFromAlphabet = (alphabet: Alphabet): BiMap => {
  return alphabet.reduce(
    (map: BiMap, letter: Letter, index: number) => {
      const letterIndex: number = getLetterIndexInAlphabet(letter);
      map.leftToRight[index] = moduloWithPositiveOrNegative(ALPHABET.length, letterIndex - index);
      map.rightToLeft[letterIndex] = moduloWithPositiveOrNegative(ALPHABET.length, -(letterIndex - index));

      return map;
    },
    { leftToRight: [], rightToLeft: [] } as BiMap,
  );
};

// for a given rotor combination returns the next one
// e.g.:
// [0, 0, 0] --> [1, 0, 0]
// [25, 0, 0] --> [0, 1, 0]
// [25, 25, 25] --> [0, 0, 0]
const getNextNumberBase26 = (numbers: number[]): number[] => {
  if (numbers.every(number => number === LetterIndex.Z)) {
    return numbers.map(() => LetterIndex.A);
  }

  const [first, ...remaining] = numbers;

  if (first === LetterIndex.Z) {
    return [LetterIndex.A, ...getNextNumberBase26(remaining)];
  }

  return [first + 1, ...remaining];
};

// for a given rotor combination returns the next one
// e.g.:
// [A, A, A] --> [B, A, A]
// [Z, A, A] --> [A, B, A]
// [Z, Z, Z] --> [A, A, A]
export const goToNextRotorCombination = (rotors: RotorsStateInternalApi): RotorsStateInternalApi => {
  if (!rotors) {
    return [LetterIndex.A, LetterIndex.A, LetterIndex.A];
  }

  return getNextNumberBase26(rotors) as RotorsStateInternalApi;
};
