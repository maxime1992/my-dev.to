import { Component } from '@angular/core';
import {
  EnigmaMachineService,
  RotorsConfiguration
} from '@enigma/enigma-machine';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rotors-current-state',
  templateUrl: './rotors-current-state.component.html',
  styleUrls: ['./rotors-current-state.component.scss']
})
export class RotorsCurrentStateComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public currentStateRotors$: Observable<RotorsConfiguration> = this
    .enigmaMachineService.currentStateRotors$;

}
