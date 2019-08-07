import { EnigmaMachineService } from './enigma-machine.service';
import { TestBed } from '@angular/core/testing';
import { EnigmaRotorService } from './enigma-rotor.service';
import { ALPHABET, Letter } from '@enigma/enigma-utility';
import { ReflectorRequiresValidAlphabet } from './reflector';
import {
  EnigmaMachineRequires3Rotors,
  DEFAULT_ENIGMA_MACHINE_PROVIDERS
} from './enigma-machine';

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
            new EnigmaRotorService(Letter.A, ALPHABET),
            new EnigmaRotorService(Letter.A, ALPHABET),
            new EnigmaRotorService(Letter.A, ALPHABET)
          ],
          'hello' as any
        )
    ).toThrowError(new ReflectorRequiresValidAlphabet());
  });
});

describe('EnigmaMachineService', () => {
  let enigmaMachineService: EnigmaMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS, EnigmaMachineService]
    });

    enigmaMachineService = TestBed.get(EnigmaMachineService);
  });

  it('should be created', () => {
    expect(enigmaMachineService).toBeTruthy();
  });

  it('should encrypt the message "hello" into "bldxb"', () => {
    expect(enigmaMachineService.encryptMessage('hello')).toEqual('bldxb');
  });
});
