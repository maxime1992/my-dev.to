import { select, takeUntilDestroyed } from '@common/rxjs-utility';
import {
  getLetterFromIndexInAlphabet,
  getLetterIndexInAlphabet,
  INDEX_ROTOR_0,
  INDEX_ROTOR_1,
  INDEX_ROTOR_2,
  InvalidLetter,
  isValidAlphabetLetter,
  Letter,
  NB_ROTORS_REQUIRED
} from '@enigma/enigma-utility';
import { flow } from 'lodash/fp';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { EnigmaRotorService } from './enigma-rotor.service';
import { ReflectorService } from './reflector.service';
import {
  goToNextRotorCombination,
  RotorsState,
  RotorsStateInternalApi
} from './rotor';

interface EnigmaMachineState {
  initialStateRotors: RotorsStateInternalApi;
  currentStateRotors: RotorsStateInternalApi;
}

export class EnigmaMachineRequires3Rotors extends Error {
  public message = `Enigma machine requires 3 rotors`;
}

// in this file we cannot use anything related to angular
// otherwise the AoT compilation will fail because it's also
// used in the web worker context

export class EnigmaMachineService {
  private readonly initialStateRotorsInternalApi$: Observable<
    RotorsStateInternalApi
  >;
  private readonly currentStateRotorsInternalApi$: Observable<
    RotorsStateInternalApi
  >;

  public readonly initialStateRotors$: Observable<RotorsState>;
  public readonly currentStateRotors$: Observable<RotorsState>;

  private readonly state$: BehaviorSubject<EnigmaMachineState>;

  private readonly encodeLetterThroughMachine: (
    letter: Letter
  ) => Letter = flow(
    // the input is always emitting the signal of a letter
    // at the same position so this one is absolute
    getLetterIndexInAlphabet,

    this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(INDEX_ROTOR_0),
    this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(INDEX_ROTOR_1),
    this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(INDEX_ROTOR_2),

    this.getRelativeIndexOutputFromReflector(),

    this.getRelativeIndexOutputFromRightRelativeIndexInputRotor(INDEX_ROTOR_2),
    this.getRelativeIndexOutputFromRightRelativeIndexInputRotor(INDEX_ROTOR_1),
    this.getRelativeIndexOutputFromRightRelativeIndexInputRotor(INDEX_ROTOR_0),

    getLetterFromIndexInAlphabet
  );

  constructor(
    private enigmaRotorServices: EnigmaRotorService[],
    private reflectorService: ReflectorService
  ) {
    if (
      this.enigmaRotorServices.length !== NB_ROTORS_REQUIRED ||
      this.enigmaRotorServices.some(
        rotorService => !(rotorService instanceof EnigmaRotorService)
      )
    ) {
      throw new EnigmaMachineRequires3Rotors();
    }

    // instantiating from the constructor as we need to check first
    // that the `enigmaRotorService` instances are correct
    const initialStateRotors: RotorsStateInternalApi = this.enigmaRotorServices.map(
      enigmaRotorService => enigmaRotorService.getCurrentRingPosition()
    ) as RotorsStateInternalApi;

    this.state$ = new BehaviorSubject({
      initialStateRotors,
      currentStateRotors: initialStateRotors
    });

    this.initialStateRotorsInternalApi$ = this.state$.pipe(
      select(state => state.initialStateRotors),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.currentStateRotorsInternalApi$ = this.state$.pipe(
      select(state => state.currentStateRotors),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.initialStateRotors$ = this.initialStateRotorsInternalApi$.pipe(
      map(this.mapInternalToPublic),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.currentStateRotors$ = this.currentStateRotorsInternalApi$.pipe(
      map(this.mapInternalToPublic),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.currentStateRotorsInternalApi$
      .pipe(
        tap(currentStateRotors =>
          this.enigmaRotorServices.forEach((rotorService, index) =>
            rotorService.setCurrentRingPosition(currentStateRotors[index])
          )
        ),
        takeUntilDestroyed(this)
      )
      .subscribe();
  }

  // here we need the `ngOnDestroy` to satisfy `takeUntilDestroyed`
  // but we cannot have anything related to angular or it'll break the
  // webworker context
  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy(): void {}

  private mapInternalToPublic(rotors: RotorsStateInternalApi): RotorsState {
    return rotors.map(rotor =>
      getLetterFromIndexInAlphabet(rotor)
    ) as RotorsState;
  }

  public encryptMessage(message: string): string {
    this.resetCurrentStateRotorsToInitialState();

    return message
      .toLowerCase()
      .split('')
      .map(letter =>
        // enigma only deals with the letters from the alphabet
        // but in this demo, typing all spaces with an "X" would
        // be slightly annoying so devianting from original a bit
        letter === ' ' ? ' ' : this.encryptLetter(letter as Letter)
      )
      .join('');
  }

  private encryptLetter(letter: Letter): Letter {
    if (!isValidAlphabetLetter(letter)) {
      throw new InvalidLetter(letter);
    }

    // clicking on a key of the machine will trigger the rotation
    // of the rotors so it has to be made first
    this.goToNextRotorCombination();

    return this.encodeLetterThroughMachine(letter);
  }

  private resetCurrentStateRotorsToInitialState(): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      currentStateRotors: [
        ...state.initialStateRotors
      ] as RotorsStateInternalApi
    });
  }

  private goToNextRotorCombination(): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      currentStateRotors: goToNextRotorCombination(state.currentStateRotors)
    });
  }

  private getRelativeIndexOutputFromLeftRelativeIndexInputRotor(
    rotorIndex: number
  ): (relativeInputIndex: number) => number {
    return (relativeInputIndex: number) =>
      this.enigmaRotorServices[rotorIndex].goThroughRotorLeftToRight(
        relativeInputIndex
      );
  }

  private getRelativeIndexOutputFromRightRelativeIndexInputRotor(
    rotorIndex: number
  ): (relativeInputIndex: number) => number {
    return (relativeInputIndex: number) =>
      this.enigmaRotorServices[rotorIndex].goThroughRotorRightToLeft(
        relativeInputIndex
      );
  }

  private getRelativeIndexOutputFromReflector(): (
    relativeInputIndex: number
  ) => number {
    return (relativeInputIndex: number) =>
      this.reflectorService.goThroughFromRelativeIndex(relativeInputIndex);
  }

  public setInitialRotorConfig(initialStateRotors: RotorsState): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      initialStateRotors: initialStateRotors.map(rotorState =>
        getLetterIndexInAlphabet(rotorState)
      ) as RotorsStateInternalApi
    });
  }
}
