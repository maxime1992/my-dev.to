import { AbstractControl } from '@angular/forms';
import { isValidAlphabetLetter } from '@enigma/enigma-utility';

export const containsOnlyAlphabetLetters = ({
  acceptSpace
}: {
  acceptSpace: boolean;
}) => (control: AbstractControl): null | { invalid: true } => {
  if (!control.value) {
    return null;
  }

  const validMessage: boolean = (control.value as string)
    .toLowerCase()
    .split('')
    .every(
      (letter: string) =>
        (acceptSpace && letter === ' ') || isValidAlphabetLetter(letter)
    );

  if (!validMessage) {
    return { invalid: true };
  }

  return null;
};
