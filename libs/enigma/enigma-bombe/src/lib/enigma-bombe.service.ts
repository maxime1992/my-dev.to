import { ConfigurationToDecrypt } from '@enigma/enigma-bombe';
import { goToNextRotorCombination, RotorsState, RotorsStateInternalApi } from '@enigma/enigma-machine';
import {
  getLetterFromIndexInAlphabet,
  INDEX_ROTOR_0,
  INDEX_ROTOR_1,
  INDEX_ROTOR_2,
  LetterIndex,
} from '@enigma/enigma-utility';

export class EnigmaBombeService {
  public *getPossibleCombinationsWithEncryptedMessage(
    encryptedMessage: string,
  ): IterableIterator<ConfigurationToDecrypt> {
    const combinationGenerator = this.getPossibleCombinations();

    for (const combination of combinationGenerator) {
      yield { encryptedMessage, initialRotorPosition: combination };
    }
  }

  private *getPossibleCombinations(): IterableIterator<RotorsState> {
    let rotorCombination: RotorsStateInternalApi = [LetterIndex.Z, LetterIndex.Z, LetterIndex.Z];

    do {
      const combination = rotorCombination.map(rotorState => getLetterFromIndexInAlphabet(rotorState)) as RotorsState;

      yield combination;

      rotorCombination = goToNextRotorCombination(rotorCombination) as RotorsStateInternalApi;
    } while (
      rotorCombination[INDEX_ROTOR_0] !== LetterIndex.Z ||
      rotorCombination[INDEX_ROTOR_1] !== LetterIndex.Z ||
      rotorCombination[INDEX_ROTOR_2] !== LetterIndex.Z
    );
  }
}
