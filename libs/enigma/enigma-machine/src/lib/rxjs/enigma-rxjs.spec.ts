import { enigmaBuilder } from './public/enigma';
import { tap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

fdescribe('Rxjs', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((v1, v2) => expect(v1).toEqual(v2));
  });

  it(`shoulb ok`, () => {
    testScheduler.run(helpers => {
      const encodedMessage$ = helpers.cold('--x', { x: 'super' });
      const decodedMessage$ = helpers.cold('--x', { x: 'cekhm' });
      const reflector$ = helpers.cold('--x', {
        x: {
          id: 'reflector-1',
          alphabetRemap: 'yruhqsldpxngokmiebfzcwvjat',
        },
      });
      const rotors$ = helpers.cold('--x', {
        x: [
          { id: 'rotor-1', alphabetRemap: 'ekmflgdqvzntowyhxuspaibrcj' },
          { id: 'rotor-2', alphabetRemap: 'ajdksiruxblhwtmcqgznpyfvoe' },
          { id: 'rotor-3', alphabetRemap: 'fvpjiaoyedrzxwgctkuqsbnmhl' },
        ],
      });
      const alphabet$ = helpers.cold('--x', { x: 'abcdefghijklmnopqrstuvwxyz' });
      const rotorsInitialConfig$ = helpers.cold('--x', {
        x: {
          'rotor-1': 'a',
          'rotor-2': 'b',
          'rotor-3': 'c',
        },
      });

      const enigma$ = enigmaBuilder({
        message$: encodedMessage$,
        alphabet$,
        rotors$,
        reflector$,
        rotorsInitialConfig$,
      });

      helpers.expectObservable(enigma$.pipe(take(1))).toBe('----(x|)', {
        x: {
          inputMessage: '',
          intermediaryResults: [],
          outputMessage: '',
        },
      });
    });
  });
});
