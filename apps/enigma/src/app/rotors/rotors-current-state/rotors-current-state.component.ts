import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnigmaMachineService, RotorsState } from '@enigma/enigma-machine';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rotors-current-state',
  templateUrl: './rotors-current-state.component.html',
  styleUrls: ['./rotors-current-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotorsCurrentStateComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public currentStateRotors$: Observable<RotorsState> = this.enigmaMachineService.currentStateRotors$;
}
