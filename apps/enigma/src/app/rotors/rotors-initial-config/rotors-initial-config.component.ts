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

  public rotorsUpdate(rotorsConfiguration: RotorsConfiguration): void {
    // @todo @hack this is a temporary fix for
    // https://github.com/cloudnc/ngx-sub-form/issues/85
    if (rotorsConfiguration.length !== 3) {
      return;
    }

    this.enigmaMachineService.setInitialRotorConfig(rotorsConfiguration);
  }
}
