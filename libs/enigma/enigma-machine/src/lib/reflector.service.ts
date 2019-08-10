import {
  Alphabet,
  getLetterIndexInAlphabet,
  InvalidAlphabet,
  isStringCompleteUnorderedAlphabet,
  Letter
} from '@enigma/enigma-utility';

export class ReflectorRequiresValidAlphabet extends Error {
  public message = `A reflector should contains the whole alphabet in any order. Nothing more, nothing less`;
}

export class ReflectorMapIndexToSameIndex extends Error {
  public message = `A reflector cannot map an index to the same index`;
}

// in this file we cannot use anything related to angular
// otherwise the AoT compilation will fail because it's also
// used in the web worker context

export class ReflectorService {
  // reflector 1 was also called "Wide B"
  public static REFLECTOR_1 = 'yruhqsldpxngokmiebfzcwvjat';
  // reflector 2 was also called "Wide C"
  public static REFLECTOR_2 = 'fvpjiaoyedrzxwgctkuqsbnmhl';

  private reflectorConfig: number[] = [];

  constructor(reflectorConfig: string) {
    this.setReflectorConfig(reflectorConfig);
  }

  private setReflectorConfig(reflectorConfig: string): void {
    const reflectorConfigSplit: string[] = reflectorConfig.split('');

    if (!isStringCompleteUnorderedAlphabet(reflectorConfigSplit)) {
      throw new InvalidAlphabet();
    }

    this.reflectorConfig = this.mapLetterIndexInAlphabetToDifferentOne(
      reflectorConfigSplit
    );

    // as the reflector can't map an index to the same index
    // we verify it's the case and throw an error otherwise
    const isReflectorIncorrect: boolean = this.reflectorConfig.some(
      (value, index) => index === value
    );

    if (isReflectorIncorrect) {
      throw new ReflectorMapIndexToSameIndex();
    }
  }

  private mapLetterIndexInAlphabetToDifferentOne(alphabet: Alphabet): number[] {
    return alphabet.reduce((map: number[], letter: Letter, index: number) => {
      map[index] = getLetterIndexInAlphabet(letter);

      return map;
    }, []);
  }

  public goThroughFromRelativeIndex(index: number): number {
    return this.reflectorConfig[index];
  }
}
