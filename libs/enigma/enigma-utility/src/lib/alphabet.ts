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

export enum LetterIndex {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  E = 4,
  F = 5,
  G = 6,
  H = 7,
  I = 8,
  J = 9,
  K = 10,
  L = 11,
  M = 12,
  N = 13,
  O = 14,
  P = 15,
  Q = 16,
  R = 17,
  S = 18,
  T = 19,
  U = 20,
  V = 21,
  W = 22,
  X = 23,
  Y = 24,
  Z = 25
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

export class InvalidAlphabet extends Error {
  public message = `The alphabet is not valid, please use letters a-z only`;
}

export const stringToAlphabet: (str: string) => Alphabet = str => {
  const alphabet = str.split('') as Alphabet;

  if (!isStringCompleteUnorderedAlphabet(alphabet)) {
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

export const isStringCompleteUnorderedAlphabet = (
  str: string[]
): str is Alphabet => {
  const alphabetSet: Set<string> = new Set(str);

  if (ALPHABET.length !== alphabetSet.size) {
    return false;
  }

  return ALPHABET.every(letter => alphabetSet.has(letter));
};

const charcodeLetterA = 97;

export const getLetterIndexInAlphabet = (letter: Letter): number => {
  if (!isValidAlphabetLetter(letter)) {
    throw new InvalidLetter(letter);
  }

  return letter.charCodeAt(0) - charcodeLetterA;
};

export const getLetterFromIndexInAlphabet = (index: number): Letter => {
  const letter = String.fromCharCode(index + charcodeLetterA) as Letter;

  if (!isValidAlphabetLetter(letter)) {
    throw new InvalidLetter(letter);
  }

  return letter;
};
