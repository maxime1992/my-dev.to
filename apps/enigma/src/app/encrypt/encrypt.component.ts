import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { EnigmaMachineService, RotorsState } from '@enigma/enigma-machine';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, sampleTime } from 'rxjs/operators';
import { DEFAULT_ENIGMA_MACHINE_PROVIDERS } from '../common/enigma-machine';
import { containsOnlyAlphabetLetters } from '../common/validators';

@Component({
  selector: 'app-encrypt',
  templateUrl: './encrypt.component.html',
  styleUrls: ['./encrypt.component.scss'],
  providers: [
    ...DEFAULT_ENIGMA_MACHINE_PROVIDERS,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncryptComponent {
  private initialStateRotors$: Observable<RotorsState> = this.enigmaMachineService.initialStateRotors$;

  public clearTextControl: FormControl = new FormControl('', containsOnlyAlphabetLetters({ acceptSpace: true }));

  private readonly clearTextValue$: Observable<string> = this.clearTextControl.valueChanges;

  public encryptedText$ = combineLatest([
    this.clearTextValue$.pipe(
      sampleTime(10),
      distinctUntilChanged(),
      filter(() => this.clearTextControl.valid),
    ),
    this.initialStateRotors$,
  ]).pipe(map(([text]) => this.enigmaMachineService.encryptMessage(text)));

  constructor(private enigmaMachineService: EnigmaMachineService) {}
}
