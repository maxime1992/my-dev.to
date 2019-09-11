import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { RotorsState } from '@enigma/enigma-machine';
import { Letter, NB_ROTORS_REQUIRED } from '@enigma/enigma-utility';
import {
  ArrayPropertyKey,
  ArrayPropertyValue,
  Controls,
  DataInput,
  FormGroupOptions,
  NgxAutomaticRootFormComponent,
  NgxFormWithArrayControls,
} from 'ngx-sub-form';
import { containsOnlyAlphabetLetters } from '../../common/validators';

interface RotorsForm {
  rotors: RotorsState;
}

@Component({
  selector: 'app-rotors-form',
  templateUrl: './rotors-form.component.html',
  styleUrls: ['./rotors-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotorsFormComponent extends NgxAutomaticRootFormComponent<RotorsState, RotorsForm>
  implements NgxFormWithArrayControls<RotorsForm> {
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('rotors')
  public dataInput: RotorsState | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('rotorsUpdate')
  public dataOutput: EventEmitter<RotorsState> = new EventEmitter();

  protected emitInitialValueOnInit = false;

  protected getFormControls(): Controls<RotorsForm> {
    return {
      rotors: new FormArray([]),
    };
  }

  protected transformToFormGroup(letters: RotorsState | null): RotorsForm {
    return {
      rotors: letters ? letters : [Letter.A, Letter.A, Letter.A],
    };
  }

  protected transformFromFormGroup(formValue: RotorsForm): RotorsState | null {
    return formValue.rotors;
  }

  protected getFormGroupControlOptions(): FormGroupOptions<RotorsForm> {
    return {
      validators: [
        formGroup => {
          if (
            !formGroup.value.rotors ||
            !Array.isArray(formGroup.value.rotors) ||
            formGroup.value.rotors.length !== NB_ROTORS_REQUIRED
          ) {
            return {
              rotorsError: true,
            };
          }

          return null;
        },
      ],
    };
  }

  public createFormArrayControl(
    key: ArrayPropertyKey<RotorsForm> | undefined,
    value: ArrayPropertyValue<RotorsForm>,
  ): FormControl {
    switch (key) {
      case 'rotors':
        return new FormControl(value, [Validators.required, containsOnlyAlphabetLetters({ acceptSpace: false })]);
      default:
        return new FormControl(value);
    }
  }
}
