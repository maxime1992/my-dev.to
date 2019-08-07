import { TestBed } from '@angular/core/testing';
import { EnigmaRotorService } from './enigma-rotor.service';
import {
  stringToAlphabet,
  InvalidAlphabet,
  Letter
} from '@enigma/enigma-utility';

describe('EnigmaRotorService', () => {
  let enigmaRotorService: EnigmaRotorService;
  const ROTOR_ALPHABET = 'ekmflgdqvzntowyhxuspaibrcj';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EnigmaRotorService,
          useFactory: () =>
            new EnigmaRotorService(Letter.A, stringToAlphabet(ROTOR_ALPHABET))
        }
      ]
    });

    enigmaRotorService = TestBed.get(EnigmaRotorService);
  });

  it(`should be created if the alphabet is containing all the 26 possible letters only once and nothing more`, () => {
    expect(
      () =>
        new EnigmaRotorService(
          Letter.A,
          stringToAlphabet('ekmflgdqvzntowyhxuspaibrcj')
        )
    ).not.toThrow();
  });

  it(`should throw an error if the alphabet is invalid`, () => {
    expect(
      () => new EnigmaRotorService(Letter.A, stringToAlphabet('hello'))
    ).toThrowError(new InvalidAlphabet());
  });
});
