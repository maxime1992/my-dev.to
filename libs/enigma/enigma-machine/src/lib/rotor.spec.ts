import { LetterIndex } from '@enigma/enigma-utility';
import { goToNextRotorCombination } from './rotor';

describe(`Alphabet`, () => {
  describe(`Increment rotors`, () => {
    it(`should go from AAA to BAA`, () => {
      expect(goToNextRotorCombination([LetterIndex.A, LetterIndex.A, LetterIndex.A])).toEqual([
        LetterIndex.B,
        LetterIndex.A,
        LetterIndex.A,
      ]);
    });

    it(`should go from ZAA to ABA`, () => {
      expect(goToNextRotorCombination([LetterIndex.Z, LetterIndex.A, LetterIndex.A])).toEqual([
        LetterIndex.A,
        LetterIndex.B,
        LetterIndex.A,
      ]);
    });

    it(`should go from ZZA to AAB`, () => {
      expect(goToNextRotorCombination([LetterIndex.Z, LetterIndex.Z, LetterIndex.A])).toEqual([
        LetterIndex.A,
        LetterIndex.A,
        LetterIndex.B,
      ]);
    });

    it(`should go from ZZZ to AAA`, () => {
      expect(goToNextRotorCombination([LetterIndex.Z, LetterIndex.Z, LetterIndex.Z])).toEqual([
        LetterIndex.A,
        LetterIndex.A,
        LetterIndex.A,
      ]);
    });
  });
});
