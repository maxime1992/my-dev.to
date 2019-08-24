import {
  EnigmaMachineService,
  EnigmaRotorService,
  ReflectorService
} from '@enigma/enigma-machine';
import { Letter } from '@enigma/enigma-utility';
import { EnigmaDecryptService } from './enigma-decrypt.service';

describe('EnigmaDecryptService', () => {
  let enigmaDecryptService: EnigmaDecryptService;

  beforeEach(() => {
    const enigmaRotorServices = [
      // by default we use the first 3 rotors
      EnigmaRotorService.ROTOR_1,
      EnigmaRotorService.ROTOR_2,
      EnigmaRotorService.ROTOR_3
    ].map(rotorConfig => new EnigmaRotorService(rotorConfig));

    const reflectorService = new ReflectorService(
      // by default we use the first reflector, also called "Wide B"
      ReflectorService.REFLECTOR_1
    );

    const enigmaMachineService: EnigmaMachineService = new EnigmaMachineService(
      enigmaRotorServices,
      reflectorService
    );

    enigmaDecryptService = new EnigmaDecryptService(enigmaMachineService);
  });

  it('should be created', () => {
    expect(enigmaDecryptService).toBeTruthy();
  });

  it('should manage to decrypt a message', () => {
    expect(
      enigmaDecryptService.decryptMessageFor1Combination(
        [Letter.F, Letter.P, Letter.R],
        `avs tiht pk wq ndupapw lzv td lvash ix znnvxrw fh jsyed pf vdwp kphrd`
      )
    ).toEqual(
      `the word we re looking for in order to succeed is hello so hang tight`
    );
  });
});
