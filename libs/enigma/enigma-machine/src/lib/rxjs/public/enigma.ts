import { BehaviorSubject, Subject, Observable, combineLatest, from, EMPTY } from 'rxjs';
import { shareReplay, map, switchMap, scan, reduce } from 'rxjs/operators';
import { EnigmaUtils } from '../internal/enigma.utils';
import { EnigmaInternal } from '../internal/enigma.interface';
import { Enigma } from './enigma.interface';

export const enigmaBuilder = (inputs: {
  message$: Observable<string>;
  alphabet$: Observable<string>;
  rotors$: Observable<Enigma.Rotor[]>;
  reflector$: Observable<Enigma.Reflector>;
  rotorsInitialConfig$: Observable<Enigma.RotorsInitialConfig>;
}) => {
  const biMapRotors$: Observable<EnigmaInternal.BiMapRotor[]> = combineLatest([inputs.rotors$, inputs.alphabet$]).pipe(
    map(([rotors, alphabet]) =>
      rotors.map(rotor => ({
        id: rotor.id,
        wires: EnigmaUtils.createBiMapFromAlphabet(rotor.alphabetRemap, alphabet),
      })),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  const reflectorToInternalReflector$: Observable<EnigmaInternal.Reflector> = combineLatest([
    inputs.reflector$,
    inputs.alphabet$,
  ]).pipe(
    map(([reflector, alphabet]) => ({
      id: reflector.id,
      wires: EnigmaUtils.createBiMapFromAlphabet(reflector.alphabetRemap, alphabet).leftToRight,
    })),
  );

  const output$: Observable<Enigma.EnigmaResult> = combineLatest([
    inputs.rotorsInitialConfig$,
    biMapRotors$,
    reflectorToInternalReflector$,
  ]).pipe(
    switchMap(([initialConfig, biMapRotors, reflector]) =>
      inputs.message$.pipe(
        switchMap(message =>
          !message
            ? EMPTY
            : from(message).pipe(
                reduce(
                  (enigma: EnigmaInternal.EnigmaStateAndResults, letter: string) =>
                    EnigmaUtils.computeEnigmaNextCombination(enigma, letter),
                  EnigmaUtils.getInitialState(biMapRotors, reflector, initialConfig),
                ),
                map(result => ({
                  intermediaryResults: [],
                  inputMessage: message,
                  outputMessage: result.results.map(x => x.outputLetter).join(''),
                })),
              ),
        ),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  return output$;
};
