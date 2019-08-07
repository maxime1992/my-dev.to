import { Injectable } from '@angular/core';
import {
  Letter,
  Alphabet,
  isValidAlphabetLetter,
  getLetterIndexInAlphabet,
  getLetterPlusXAlphabetLoop
} from '@enigma/enigma-utility';
import {
  InvalidRingPosition,
  AlphabetLeftAndRightMap,
  mapScrambledAlphabetToRotorIndexOutput,
  relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex
} from './rotor';

@Injectable()
export class EnigmaRotorService {
  private alphabetMapping: AlphabetLeftAndRightMap;

  constructor(private currentRingPosition: Letter, alphabetOutput: Alphabet) {
    this.alphabetMapping = mapScrambledAlphabetToRotorIndexOutput(
      alphabetOutput
    );

    this.throwIfInvalidRingPosition();
  }

  private throwIfInvalidRingPosition(): void {
    if (!isValidAlphabetLetter(this.getCurrentRingPosition())) {
      throw new InvalidRingPosition(this.getCurrentRingPosition());
    }
  }

  public setCurrentRingPosition(ringPosition: Letter): void {
    this.currentRingPosition = ringPosition;
  }

  public getCurrentRingPosition(): Letter {
    return this.currentRingPosition;
  }

  public getRelativeIndexOutputFromLeftRelativeIndexInput(
    relativeIndexInput: number
  ): number {
    const targetedLetter: Letter = getLetterPlusXAlphabetLoop(
      this.getCurrentRingPosition(),
      relativeIndexInput
    );

    const absoluteIndexOutput: number = this.alphabetMapping.leftToRight[
      targetedLetter
    ];

    const relativeIndexOfOutput: number = relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex(
      this.getCurrentRingPosition(),
      absoluteIndexOutput
    );

    return relativeIndexOfOutput;
  }

  public getRelativeIndexOutputFromRightRelativeIndexInput(
    relativeIndexInput: number
  ): number {
    const absoluteTargetedIndex: number = getLetterIndexInAlphabet(
      getLetterPlusXAlphabetLoop(
        this.getCurrentRingPosition(),
        relativeIndexInput
      )
    );

    const letterOutput: Letter = this.alphabetMapping.rightToLeft[
      absoluteTargetedIndex
    ];

    return relativeDistanceBetweenCurrentRottorRingPositionAndOutputIndex(
      this.getCurrentRingPosition(),
      getLetterIndexInAlphabet(letterOutput)
    );
  }
}
