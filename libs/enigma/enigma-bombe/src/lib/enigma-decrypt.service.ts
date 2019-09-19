import { EnigmaMachineService, RotorsState } from '@enigma/enigma-machine';
// @todo this should be moved out and retrieved from an http call
import { WORDS } from './words';

// the following class is meant to be used by the web worker
// so it doesn't have the decorator @Injectable nor anything
// angular related

const wordMinLength = 3;
const thresholdWordsFoundToBeConsideredEnglishWord = 3;

export class EnigmaDecryptService {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public decryptMessageFor1Combination(initialRotorPosition: RotorsState, encryptedMessage: string): string | null {
    this.enigmaMachineService.setInitialRotorConfig(initialRotorPosition);

    return this.getMessageIfEnglish(this.enigmaMachineService.encryptMessage(encryptedMessage));
  }

  private getMessageIfEnglish(decryptedMessage: string): string | null {
    const decryptedMessageWords = decryptedMessage.split(' ');
    let foundWordsCounter = 0;

    for (let index = 0; index < decryptedMessageWords.length; index++) {
      const element = decryptedMessageWords[index];

      if (element.length > wordMinLength && WORDS.has(element)) {
        foundWordsCounter++;
      }

      if (foundWordsCounter >= thresholdWordsFoundToBeConsideredEnglishWord) {
        return decryptedMessage;
      }
    }

    return null;
  }
}
