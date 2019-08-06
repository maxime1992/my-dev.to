import { Component } from '@angular/core';
import {
  EnigmaMachineService,
  RotorsConfiguration
} from '@enigma/enigma-machine';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rotors-initial-config',
  templateUrl: './rotors-initial-config.component.html',
  styleUrls: ['./rotors-initial-config.component.scss']
})
export class RotorsInitialConfigComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public rotorsConfiguration$: Observable<RotorsConfiguration> = this
    .enigmaMachineService.rotorsConfiguration$;
}
