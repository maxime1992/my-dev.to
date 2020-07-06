import { AbstractControl, ValidatorFn } from '@angular/forms';

const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuidV4 = (str: string): boolean => v4Regex.test(str);

export const uuidV4Validator = (): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && isUuidV4(control.value)) {
      return null;
    }

    return {
      invalidUuidV4: true,
    };
  };
};
