import {
  Letter,
  getLetterIndexInAlphabet,
  getNextLetter
} from '@enigma/enigma-utility';
import {
  relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex,
  goToNextRotorCombination
} from './rotor';

describe(`Alphabet`, () => {
  describe(`distanceBetweenLetters`, () => {
    it(`should have a 0 distance with the same letter`, () => {
      expect(
        relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex(
          Letter.A,
          0
        )
      ).toBe(0);
    });

    it(`should have a distance of 2 between E and G`, () => {
      expect(
        relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex(
          Letter.E,
          getLetterIndexInAlphabet(Letter.G)
        )
      ).toBe(2);
    });

    it(`should have a 24 distance between G and E`, () => {
      expect(
        relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex(
          Letter.G,
          getLetterIndexInAlphabet(Letter.E)
        )
      ).toBe(24);
    });
  });

  describe(`getNextLetter`, () => {
    expect(getNextLetter(Letter.A)).toBe(Letter.B);
    expect(getNextLetter(Letter.J)).toBe(Letter.K);
    expect(getNextLetter(Letter.Y)).toBe(Letter.Z);
    expect(getNextLetter(Letter.Z)).toBe(Letter.A);
  });

  describe(`Increment rotors`, () => {
    it(`should go from AAA to BAA`, () => {
      expect(goToNextRotorCombination([Letter.A, Letter.A, Letter.A])).toEqual([
        Letter.B,
        Letter.A,
        Letter.A
      ]);
    });

    it(`should go from ZAA to ABA`, () => {
      expect(goToNextRotorCombination([Letter.Z, Letter.A, Letter.A])).toEqual([
        Letter.A,
        Letter.B,
        Letter.A
      ]);
    });

    it(`should go from ZZA to AAB`, () => {
      expect(goToNextRotorCombination([Letter.Z, Letter.Z, Letter.A])).toEqual([
        Letter.A,
        Letter.A,
        Letter.B
      ]);
    });

    it(`should go from ZZZ to AAA`, () => {
      expect(goToNextRotorCombination([Letter.Z, Letter.Z, Letter.Z])).toEqual([
        Letter.A,
        Letter.A,
        Letter.A
      ]);
    });
  });
});
