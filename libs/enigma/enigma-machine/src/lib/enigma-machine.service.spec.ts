import { FactoryProvider, InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ALPHABET, InvalidAlphabet, LetterIndex } from '@enigma/enigma-utility';
import {
  EnigmaMachineRequires3Rotors,
  EnigmaMachineService
} from './enigma-machine.service';
import { EnigmaRotorService } from './enigma-rotor.service';
import { ReflectorService } from './reflector.service';

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

describe(`EnigmaMachineService`, () => {
  it(`should throw an error if there's not 3 rotors`, () => {
    expect(() => new EnigmaMachineService([], null as any)).toThrowError(
      new EnigmaMachineRequires3Rotors()
    );
  });

  it(`should throw an error if at least one of the 3 rotors are not instances of the EnigmaRotorService`, () => {
    class Random {}

    expect(
      () =>
        new EnigmaMachineService(
          [new Random() as any, new Random() as any, new Random() as any],
          null as any
        )
    ).toThrowError(new EnigmaMachineRequires3Rotors());
  });

  it(`should throw an error if the alphabet of the reflector isn't valid`, () => {
    expect(
      () =>
        new EnigmaMachineService(
          [
            new EnigmaRotorService(ALPHABET.join(''), LetterIndex.A),
            new EnigmaRotorService(ALPHABET.join(''), LetterIndex.A),
            new EnigmaRotorService(ALPHABET.join(''), LetterIndex.A)
          ],
          new ReflectorService('incorrect reflector')
        )
    ).toThrowError(new InvalidAlphabet());
  });
});

describe('EnigmaMachineService', () => {
  let enigmaMachineService: EnigmaMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS]
    });

    enigmaMachineService = TestBed.get(EnigmaMachineService);
  });

  it('should be created', () => {
    expect(enigmaMachineService).toBeTruthy();
  });

  it('should encrypt the message "hello" into "bldxb"', () => {
    expect(enigmaMachineService.encryptMessage('hello')).toEqual('coxsd');
  });

  it('should decrypt the message "coxsd" into "hello"', () => {
    expect(enigmaMachineService.encryptMessage('hello')).toEqual('coxsd');
  });
});
