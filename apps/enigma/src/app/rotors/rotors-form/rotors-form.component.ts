import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Letter } from '@enigma/enigma-machine';
import {
  NgxSubFormRemapComponent,
  NgxFormWithArrayControls,
  Controls,
  ArrayPropertyKey,
  ArrayPropertyValue,
  NgxAutomaticRootFormComponent,
  DataInput
} from 'ngx-sub-form';
import { FormArray, FormControl, Validators } from '@angular/forms';

interface RotorsForm {
  rotors: Letter[];
}

@Component({
  selector: 'app-rotors-form',
  templateUrl: './rotors-form.component.html',
  styleUrls: ['./rotors-form.component.scss']
})
export class RotorsFormComponent
  extends NgxAutomaticRootFormComponent<Letter[], RotorsForm>
  implements NgxFormWithArrayControls<RotorsForm> {
  // @todo the DataInput has a type error
  // and the error is coming from ngx-sub-form
  // https://github.com/cloudnc/ngx-sub-form/issues/83
  @DataInput()
  @Input('rotors')
  dataInput: Letter[] | null | undefined;

  @Output()
  dataOutput: EventEmitter<Letter[]> = new EventEmitter();

  protected getFormControls(): Controls<RotorsForm> {
    return {
      rotors: new FormArray([])
    };
  }

  protected transformToFormGroup(letters: Letter[] | null): RotorsForm {
    return {
      rotors: letters ? letters : []
    };
  }

  protected transformFromFormGroup(formValue: RotorsForm): Letter[] | null {
    return formValue.rotors;
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
