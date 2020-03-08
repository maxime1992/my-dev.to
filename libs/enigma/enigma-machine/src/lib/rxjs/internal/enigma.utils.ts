import { Mutable } from '@common/type-utility';
import { Enigma } from '../public/enigma.interface';
import { EnigmaInternal } from './enigma.interface';

export namespace EnigmaUtils {
  const CHAR_CODE_LETTER_A = 97;

  export const getLetterIndexInAlphabet = (letter: string): number => letter.charCodeAt(0) - CHAR_CODE_LETTER_A;

  export const getLetterFromIndexInAlphabet = (index: number): string =>
    String.fromCharCode(index + CHAR_CODE_LETTER_A);

  export const moduloWithPositiveOrNegative = (base: number, number: number) => (number > 0 ? number : base + number);

  export const createBiMapFromAlphabet = (
    rotorAlphabetLetters: string,
    rotorAlphabet: string,
  ): EnigmaInternal.BiMap => {
    return rotorAlphabetLetters.split('').reduce(
      (biMap: EnigmaInternal.BiMap, letter: string, index: number) => {
        const letterIndex: number = getLetterIndexInAlphabet(letter);
        biMap.leftToRight[index] = moduloWithPositiveOrNegative(rotorAlphabet.length, letterIndex - index);
        biMap.rightToLeft[letterIndex] = moduloWithPositiveOrNegative(rotorAlphabet.length, -(letterIndex - index));

        return biMap;
      },
      { leftToRight: [], rightToLeft: [] } as EnigmaInternal.BiMap,
    );
  };

  // for a given rotor combination returns the next one
  // e.g.:
  // [0, 0, 0] --> [1, 0, 0]
  // [25, 0, 0] --> [0, 1, 0]
  // [25, 25, 25] --> [0, 0, 0]
  export const getNextNumberBase26 = (numbers: number[]): number[] => {
    if (numbers.every(number => number === 25)) {
      return numbers.map(() => 0);
    }

    const [first, ...remaining] = numbers;

    if (first === 25) {
      return [0, ...getNextNumberBase26(remaining)];
    }

    return [first + 1, ...remaining];
  };

  // for a given rotor combination returns the next one
  // e.g.:
  // [A, A, A] --> [B, A, A]
  // [Z, A, A] --> [A, B, A]
  // [Z, Z, Z] --> [A, A, A]
  export const getNextRotorCombination = (rotors: number[]): number[] => {
    if (!rotors) {
      return [0, 0, 0];
    }

    return getNextNumberBase26(rotors);
  };

  export const computeEnigmaNextCombination = (
    enigma: EnigmaInternal.EnigmaStateAndResults,
    entryLetter: string,
  ): EnigmaInternal.EnigmaStateAndResults => {
    const lastIndex = getLetterIndexInAlphabet(entryLetter);
    const nextRotorsPositions: number[] = getNextRotorCombination(
      enigma.state.rotors.map(rotor => enigma.state.currentRotorsPositions[rotor.id]),
    );

    const lastIndexAndEnigma: EnigmaInternal.LastIndexAndEnigma = {
      enigma: {
        ...enigma,
        state: {
          ...enigma.state,
          currentRotorsPositions: enigma.state.rotors.reduce(
            (rotorsAcc, rotor, index) => {
              rotorsAcc[rotor.id] = nextRotorsPositions[index];
              return rotorsAcc;
            },
            {} as Mutable<EnigmaInternal.CurrentRotorsPositions>,
          ),
        },
        results: [
          ...enigma.results,
          {
            inputLetter: entryLetter,
            outputLetter: '',
            goingThroughReflector: { in: 0, out: 0 },
            goingThroughRotorsLeftToRight: [],
            goingThroughRotorsRightToLeft: [],
          },
        ],
      },
      lastIndex,
    };

    const leftToRight: EnigmaInternal.LastIndexAndEnigma = enigma.state.rotors.reduce((acc, rotor) => {
      const outputIndex = goThroughRotorOrReflector(
        rotor.wires.leftToRight,
        enigma.state.currentRotorsPositions[rotor.id],
        acc.lastIndex,
      );

      const result = acc.enigma.results;
      result.goingThroughRotorsLeftToRight

      return {
        ...acc,
        lastIndex: outputIndex,
        enigma: {
          ...acc.enigma,
          results: [
            ...result,
            goingThroughRotorsLeftToRight: [
              ...(result.goingThroughRotorsLeftToRight || []),
              { in: acc.lastIndex, out: outputIndex },
            ],
          ]
        },
      };
    }, lastIndexAndEnigma);

    const reflectorNewIndex = goThroughRotorOrReflector(enigma.state.reflector.wires, 0, leftToRight.lastIndex);

    const throughReflector: EnigmaInternal.LastIndexAndEnigma = {
      ...leftToRight,
      lastIndex: reflectorNewIndex,
      enigma: {
        ...leftToRight.enigma,
        results: {
          ...leftToRight.enigma.results,
          goingThroughReflector: {
            in: leftToRight.lastIndex,
            out: reflectorNewIndex,
          },
        },
      },
    };

    const rightToLeft: EnigmaInternal.LastIndexAndEnigma = enigma.state.rotors.reduceRight((acc, rotor) => {
      const outputIndex = goThroughRotorOrReflector(
        rotor.wires.rightToLeft,
        enigma.state.currentRotorsPositions[rotor.id],
        acc.lastIndex,
      );

      const result = acc.enigma.results;

      return {
        ...acc,
        lastIndex: outputIndex,
        enigma: {
          ...acc.enigma,
          results: {
            ...acc.enigma.results,
            goingThroughRotorsLeftToRight: [
              ...(result.goingThroughRotorsLeftToRight || []),
              { in: acc.lastIndex, out: outputIndex },
            ],
          },
        },
      };
    }, throughReflector);

    return {
      ...rightToLeft.enigma,
      results: {
        ...rightToLeft.enigma.results,
        outputLetter: getLetterFromIndexInAlphabet(rightToLeft.lastIndex),
      },
    };
  };

  export const goThroughRotorOrReflector = (
    rotorOrReflector: number[],
    currentRotorPosition: number,
    relativeIndexInput: number,
  ): number => {
    const currentRelativeIndexOutput = rotorOrReflector[(currentRotorPosition + relativeIndexInput) % 26];

    return (relativeIndexInput + currentRelativeIndexOutput) % 26;
  };

  export const getInitialState = (
    biMapRotors: EnigmaInternal.BiMapRotor[],
    reflector: EnigmaInternal.Reflector,
    initialConfig: Enigma.RotorsInitialConfig,
  ): EnigmaInternal.EnigmaStateAndResults => ({
    state: {
      rotors: biMapRotors,
      reflector,
      currentRotorsPositions: biMapRotors.reduce(
        (acc, rotor) => {
          acc[rotor.id] = getLetterIndexInAlphabet(initialConfig[rotor.id]);
          return acc;
        },
        {} as Mutable<EnigmaInternal.CurrentRotorsPositions>,
      ),
    },
    results: {
      inputLetter: null,
      outputLetter: null,
      goingThroughRotorsLeftToRight: null,
      goingThroughRotorsRightToLeft: null,
      goingThroughReflector: null,
    },
  });
}
