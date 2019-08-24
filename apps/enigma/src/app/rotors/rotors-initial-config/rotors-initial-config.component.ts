import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnigmaMachineService, RotorsState } from '@enigma/enigma-machine';
import { NB_ROTORS_REQUIRED } from '@enigma/enigma-utility';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rotors-initial-config',
  templateUrl: './rotors-initial-config.component.html',
  styleUrls: ['./rotors-initial-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotorsInitialConfigComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public initialStateRotors$: Observable<RotorsState> = this
    .enigmaMachineService.initialStateRotors$;

  public rotorsUpdate(rotorsConfiguration: RotorsState): void {
    // @todo @hack this is a temporary fix for
    // https://github.com/cloudnc/ngx-sub-form/issues/85
    if (rotorsConfiguration.length !== NB_ROTORS_REQUIRED) {
      return;
    }

    this.enigmaMachineService.setInitialRotorConfig(rotorsConfiguration);
  }
}
