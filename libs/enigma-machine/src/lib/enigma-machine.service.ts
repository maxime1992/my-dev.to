import { Injectable, Inject } from '@angular/core';
import { flow } from 'lodash/fp';
import { EnigmaRotorService } from './enigma-rotor.service';
import {
  Alphabet,
  isValidAlphabetLetter,
  Letter,
  InvalidLetter,
  isAlphabetValid,
  getLetterIndexInAlphabet,
  ALPHABET
} from './alphabet';
import { REFLECTOR, ReflectorRequiresValidAlphabet } from './reflector';
import { BehaviorSubject, Observable } from 'rxjs';
import { select } from './utils/rxjs-operators';
import {
  RotorLeftLetterMappedToRightIndex,
  goToNextRotorCombination,
  RotorsConfiguration
} from './rotor';
import { ROTORS, EnigmaMachineRequires3Rotors } from './enigma-machine';

interface EnigmaMachineConfig {
  rotors: RotorsConfiguration;
}

interface EnigmaMachineState {
  config: EnigmaMachineConfig;
  currentStateRotors: RotorsConfiguration;
}

@Injectable()
export class EnigmaMachineService {
  private readonly state$: BehaviorSubject<EnigmaMachineState>;
  private readonly config$: Observable<EnigmaMachineConfig>;
  public readonly rotorsConfiguration$: Observable<RotorsConfiguration>;
  public readonly currentStateRotors$: Observable<RotorsConfiguration>;

  constructor(
    @Inject(ROTORS) private enigmaRotorServices: EnigmaRotorService[],
    @Inject(REFLECTOR) private reflector: RotorLeftLetterMappedToRightIndex
  ) {
    if (
      this.enigmaRotorServices.length !== 3 ||
      this.enigmaRotorServices.some(
        rotorService => !(rotorService instanceof EnigmaRotorService)
      )
    ) {
      throw new EnigmaMachineRequires3Rotors();
    }

    if (!isAlphabetValid(Object.keys(this.reflector) as Alphabet)) {
      throw new ReflectorRequiresValidAlphabet();
    }

    // instantiating from the constructor as we need to check first
    // that the `enigmaRotorService` instances are correct
    this.state$ = new BehaviorSubject({
      config: {
        rotors: this.enigmaRotorServices.map(enigmaRotorService =>
          enigmaRotorService.getCurrentRingPosition()
        ) as RotorsConfiguration
      },
      currentStateRotors: this.enigmaRotorServices.map(enigmaRotorService =>
        enigmaRotorService.getCurrentRingPosition()
      ) as RotorsConfiguration
    });
    this.config$ = this.state$.pipe(select(state => state.config));
    this.rotorsConfiguration$ = this.config$.pipe(
      select(config => config.rotors)
    );
    this.currentStateRotors$ = this.state$.pipe(
      select(state => state.currentStateRotors)
    );
  }

  public encryptMessage(message: string): string {
    return message
      .split('')
      .map(letter =>
        // enigma only deals with the letters from the alphabet
        // but in this demo, typing all spaces with an "X" would
        // be slightly annoying so devianting from original a bit
        letter === ' ' ? ' ' : this.encryptLetter(letter as Letter)
      )
      .join('');
  }

  public encryptLetter(letter: Letter): Letter {
    if (!isValidAlphabetLetter(letter)) {
      throw new InvalidLetter(letter);
    }

    // clicking on a key of the machine will trigger the rotation
    // of the rotors so it has to be made first
    this.goToNextRotorCombination();

    return flow(
      this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(0),
      this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(1),
      this.getRelativeIndexOutputFromLeftRelativeIndexInputRotor(2),

      this.getRelativeIndexOutputFromReflector(),

      this.getRelativeIndexOutputFromRightRelativeIndexInput(2),
      this.getRelativeIndexOutputFromRightRelativeIndexInput(1),
      this.getRelativeIndexOutputFromRightRelativeIndexInput(0),

      this.getLetterFromIndex()
    )(
      // the input is always emitting the signal of a letter
      // at the same position so this one is absolute
      getLetterIndexInAlphabet(letter)
    );
  }

  private goToNextRotorCombination(): void {
    const state: EnigmaMachineState = this.state$.getValue();
    const [letterRotor1, letterRotor2, letterRotor3] = state.currentStateRotors;

    const newStateRotors: RotorsConfiguration = goToNextRotorCombination([
      letterRotor1,
      letterRotor2,
      letterRotor3
    ]) as RotorsConfiguration;

    this.state$.next({
      ...state,
      currentStateRotors: newStateRotors
    });

    this.enigmaRotorServices.forEach((rotorService, index) =>
      rotorService.setCurrentRingPosition(state.currentStateRotors[index])
    );
  }

  private getRelativeIndexOutputFromLeftRelativeIndexInputRotor(
    rotorIndex: number
  ): (relativeInputIndex: number) => number {
    return (relativeInputIndex: number) =>
      this.enigmaRotorServices[
        rotorIndex
      ].getRelativeIndexOutputFromLeftRelativeIndexInput(relativeInputIndex);
  }

  private getRelativeIndexOutputFromRightRelativeIndexInput(
    rotorIndex: number
  ): (relativeInputIndex: number) => number {
    return (relativeInputIndex: number) =>
      this.enigmaRotorServices[
        rotorIndex
      ].getRelativeIndexOutputFromRightRelativeIndexInput(relativeInputIndex);
  }

  private getLetterFromIndex(): (relativeInputIndex: number) => Letter {
    return (relativeInputIndex: number) => ALPHABET[relativeInputIndex];
  }

  private getRelativeIndexOutputFromReflector(): (
    relativeInputIndex: number
  ) => number {
    return (relativeInputIndex: number) =>
      this.reflector[ALPHABET[relativeInputIndex]];
  }
}
