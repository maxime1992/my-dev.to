import { NgModule } from '@angular/core';
import { RotorsFormComponent } from './rotors-form/rotors-form.component';
import { CommonModule } from '../common/common.module';
import { RotorsInitialConfigComponent } from './rotors-initial-config/rotors-initial-config.component';
import { RotorsCurrentStateComponent } from './rotors-current-state/rotors-current-state.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    RotorsFormComponent,
    RotorsInitialConfigComponent,
    RotorsCurrentStateComponent
  ],
  exports: [RotorsInitialConfigComponent, RotorsCurrentStateComponent]
})
export class RotorsModule {}
