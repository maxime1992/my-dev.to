import { FactoryProvider, InjectionToken, Provider } from '@angular/core';
import {
  EnigmaMachineService,
  EnigmaRotorService,
  ReflectorService
} from '@enigma/enigma-machine';

export const ROTORS: InjectionToken<EnigmaRotorService[]> = new InjectionToken<
  EnigmaRotorService[]
>('EnigmaRotorServices');

export const getReflectorService = () => {
  return new ReflectorService(
    // by default we use the first reflector, also called "Wide B"
    ReflectorService.REFLECTOR_1
  );
};

export const getRotorService = (rotor: string) => {
  return () => new EnigmaRotorService(rotor);
};

export const getEnigmaMachineService = (
  rotorServices: EnigmaRotorService[],
  reflectorService: ReflectorService
) => {
  return new EnigmaMachineService(rotorServices, reflectorService);
};

export const DEFAULT_ENIGMA_MACHINE_PROVIDERS: (
  | Provider
  | FactoryProvider)[] = [
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(EnigmaRotorService.ROTOR_1)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(EnigmaRotorService.ROTOR_2)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(EnigmaRotorService.ROTOR_3)
  },
  {
    provide: ReflectorService,
    useFactory: getReflectorService
  },
  {
    provide: EnigmaMachineService,
    deps: [ROTORS, ReflectorService],
    useFactory: getEnigmaMachineService
  }
];
