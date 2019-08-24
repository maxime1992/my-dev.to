import { TestBed } from '@angular/core/testing';
import { InvalidAlphabet, LetterIndex } from '@enigma/enigma-utility';
import { EnigmaRotorService } from './enigma-rotor.service';

describe('EnigmaRotorService', () => {
  let enigmaRotorService: EnigmaRotorService;
  const ROTOR_ALPHABET = 'ekmflgdqvzntowyhxuspaibrcj';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EnigmaRotorService,
          useFactory: () =>
            new EnigmaRotorService(ROTOR_ALPHABET, LetterIndex.A)
        }
      ]
    });

    enigmaRotorService = TestBed.get(EnigmaRotorService);
  });

  it(`should be created if the alphabet is containing all the 26 possible letters only once and nothing more`, () => {
    expect(
      () => new EnigmaRotorService(ROTOR_ALPHABET, LetterIndex.A)
    ).not.toThrow();
  });

  it(`should throw an error if the alphabet is invalid`, () => {
    expect(
      () => new EnigmaRotorService('incorrect alphabet', LetterIndex.A)
    ).toThrowError(new InvalidAlphabet());
  });
});
