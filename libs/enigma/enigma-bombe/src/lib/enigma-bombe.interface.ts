import { RotorsState } from '@enigma/enigma-machine';

export interface ConfigurationToDecrypt {
  initialRotorPosition: RotorsState;
  encryptedMessage: string;
}
