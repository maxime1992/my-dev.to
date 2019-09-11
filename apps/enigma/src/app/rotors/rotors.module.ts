import { NgModule } from '@angular/core';
import { CommonModule } from '../common/common.module';
import { RotorsCurrentStateComponent } from './rotors-current-state/rotors-current-state.component';
import { RotorsFormComponent } from './rotors-form/rotors-form.component';
import { RotorsInitialConfigComponent } from './rotors-initial-config/rotors-initial-config.component';

@NgModule({
  imports: [CommonModule],
  declarations: [RotorsFormComponent, RotorsInitialConfigComponent, RotorsCurrentStateComponent],
  exports: [RotorsInitialConfigComponent, RotorsCurrentStateComponent],
})
export class RotorsModule {}
