export enum Letter {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
  I = 'i',
  J = 'j',
  K = 'k',
  L = 'l',
  M = 'm',
  N = 'n',
  O = 'o',
  P = 'p',
  Q = 'q',
  R = 'r',
  S = 's',
  T = 't',
  U = 'u',
  V = 'v',
  W = 'w',
  X = 'x',
  Y = 'y',
  Z = 'z'
}

// can be used to check if a char is valid letter
// ex !!validLettersMap['a'] --> true
// ex !!validLettersMap['$'] --> false
const validLettersMap: { [letter in Letter]: true } = Object.values(
  Letter
).reduce((letters, letter) => {
  letters[letter] = true;
  return letters;
}, {});

export type Alphabet = Letter[];

export const ALPHABET: Alphabet = Object.values(Letter).sort(
  (l1: Letter, l2: Letter) => l1.localeCompare(l2)
);

export const getNextLetter = (letter: Letter): Letter => {
  if (letter === Letter.Z) {
    return Letter.A;
  }

  return String.fromCharCode(
    // here we don't use `getLetterIndexInAlphabet` as the
    // `String.fromCharCode` method expects the index starting
    // from 97 for "A", not 0
    letter.charCodeAt(0) + 1
  ) as Letter;
};

// request a letter + X and loop over the alphabet
// so that if you reach the end it'll start from a
// e.g.
// a + 1 = b
// a + 3 = d
// z + 1 = a
export const getLetterPlusXAlphabetLoop = (
  letter: Letter,
  toAdd: number
): Letter =>
  !toAdd
    ? letter
    : getLetterPlusXAlphabetLoop(getNextLetter(letter), toAdd - 1);

export class InvalidAlphabet extends Error {
  message = `The alphabet is not valid, please use letters a-z only`;
}

export const stringToAlphabet: (str: string) => Alphabet = str => {
  const alphabet = str.split('') as Alphabet;

  if (!isAlphabetValid(alphabet)) {
    throw new InvalidAlphabet();
  }

  return alphabet;
};

export const isValidAlphabetLetter = (letter: string): letter is Letter => {
  return validLettersMap[letter as Letter];
};

export class InvalidLetter extends Error {
  constructor(letter: string) {
    super(`The letter "${letter}" is not valid, please use letters a-z only`);
  }
}

export const isAlphabetValid = (alphabet: Alphabet): boolean => {
  const alphabetSet: Set<Letter> = new Set(alphabet);

  if (ALPHABET.length !== alphabetSet.size) {
    return false;
  }

  return ALPHABET.every(letter => alphabetSet.has(letter));
};

export const getLetterIndexInAlphabet = (letter: Letter): number => {
  return letter.charCodeAt(0) - 97;
};
