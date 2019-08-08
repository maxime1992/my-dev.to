import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Letter } from '@enigma/enigma-utility';
import {
  NgxFormWithArrayControls,
  Controls,
  ArrayPropertyKey,
  ArrayPropertyValue,
  NgxAutomaticRootFormComponent,
  DataInput,
  FormGroupOptions
} from 'ngx-sub-form';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { RotorsConfiguration } from '@enigma/enigma-machine';

interface RotorsForm {
  rotors: RotorsConfiguration;
}

@Component({
  selector: 'app-rotors-form',
  templateUrl: './rotors-form.component.html',
  styleUrls: ['./rotors-form.component.scss']
})
export class RotorsFormComponent
  extends NgxAutomaticRootFormComponent<RotorsConfiguration, RotorsForm>
  implements NgxFormWithArrayControls<RotorsForm> {
  // @todo the DataInput has a type error
  // and the error is coming from ngx-sub-form
  // https://github.com/cloudnc/ngx-sub-form/issues/83
  @((DataInput as any)())
  // tslint:disable-next-line:no-input-rename
  @Input('rotors')
  dataInput: RotorsConfiguration | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('rotorsUpdate')
  dataOutput: EventEmitter<RotorsConfiguration> = new EventEmitter();

  protected emitInitialValueOnInit = false;

  protected getFormControls(): Controls<RotorsForm> {
    return {
      rotors: new FormArray([])
    };
  }

  protected transformToFormGroup(
    letters: RotorsConfiguration | null
  ): RotorsForm {
    return {
      rotors: letters ? letters : [Letter.A, Letter.A, Letter.A]
    };
  }

  protected transformFromFormGroup(
    formValue: RotorsForm
  ): RotorsConfiguration | null {
    return formValue.rotors;
  }

  protected getFormGroupControlOptions(): FormGroupOptions<RotorsForm> {
    return {
      validators: [
        formGroup => {
          if (
            !formGroup.value.rotors ||
            !Array.isArray(formGroup.value.rotors) ||
            formGroup.value.rotors.length !== 3
          ) {
            return {
              rotorsError: true
            };
          }

          return null;
        }
      ]
    };
  }

  public createFormArrayControl(
    key: ArrayPropertyKey<RotorsForm> | undefined,
    value: ArrayPropertyValue<RotorsForm>
  ): FormControl {
    switch (key) {
      case 'rotors':
        return new FormControl(value, [Validators.required]);
      default:
        return new FormControl(value);
    }
  }
}
