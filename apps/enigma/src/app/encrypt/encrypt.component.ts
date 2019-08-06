import { Component } from '@angular/core';
import {
  EnigmaMachineService,
  RotorsConfiguration
} from '@enigma/enigma-machine';
import { FormControl, AbstractControl } from '@angular/forms';
import { map, sampleTime, distinctUntilChanged, filter } from 'rxjs/operators';
import {
  DEFAULT_ENIGMA_MACHINE_PROVIDERS,
  isValidAlphabetLetter
} from '@enigma/enigma-machine';
import {
  ShowOnDirtyErrorStateMatcher,
  ErrorStateMatcher
} from '@angular/material/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-encrypt',
  templateUrl: './encrypt.component.html',
  styleUrls: ['./encrypt.component.scss'],
  providers: [
    ...DEFAULT_ENIGMA_MACHINE_PROVIDERS,
    EnigmaMachineService,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class EncryptComponent {
  public clearTextControl: FormControl = new FormControl(
    null,
    this.isValidMessage
  );

  public encryptedText$ = this.clearTextControl.valueChanges.pipe(
    sampleTime(10),
    distinctUntilChanged(),
    filter(() => this.clearTextControl.valid),
    map((text: string) => this.enigmaMachineService.encryptMessage(text))
  );

  constructor(private enigmaMachineService: EnigmaMachineService) {}

  private isValidMessage(
    control: AbstractControl
  ): null | { invalidMessage: true } {
    if (!control.value) {
      return null;
    }

    const validMessage: boolean = (control.value as string)
      .toLowerCase()
      .split('')
      .every(
        (letter: string) => letter === ' ' || isValidAlphabetLetter(letter)
      );

    if (!validMessage) {
      return { invalidMessage: true };
    }

    return null;
  }
}
