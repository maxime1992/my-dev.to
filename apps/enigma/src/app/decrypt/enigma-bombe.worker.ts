import { ConfigurationToDecrypt, EnigmaDecryptService } from '@enigma/enigma-bombe';
import { EnigmaMachineService, EnigmaRotorService, ReflectorService } from '@enigma/enigma-machine';
import { DoWorkUnit, ObservableWorker } from 'observable-webworker';
import { Observable, of } from 'rxjs';

// all the following is part of a web worker so we're not into
// an Angular context anymore and we don't have any DI here
// we need to manually instantiate the required classes

@ObservableWorker()
export class EnigmaBombeWorker implements DoWorkUnit<ConfigurationToDecrypt, string | null> {
  private enigmaDecryptService: EnigmaDecryptService;

  constructor() {
    const enigmaRotorServices = [
      // by default we use the first 3 rotors
      EnigmaRotorService.ROTOR_1,
      EnigmaRotorService.ROTOR_2,
      EnigmaRotorService.ROTOR_3,
    ].map(rotorConfig => new EnigmaRotorService(rotorConfig));

    const reflectorService = new ReflectorService(
      // by default we use the first reflector, also called "Wide B"
      ReflectorService.REFLECTOR_1,
    );

    const enigmaMachineService: EnigmaMachineService = new EnigmaMachineService(enigmaRotorServices, reflectorService);

    this.enigmaDecryptService = new EnigmaDecryptService(enigmaMachineService);
  }

  public workUnit(input: ConfigurationToDecrypt): Observable<string | null> {
    return of(
      this.enigmaDecryptService.decryptMessageFor1Combination(input.initialRotorPosition, input.encryptedMessage),
    );
  }
}
