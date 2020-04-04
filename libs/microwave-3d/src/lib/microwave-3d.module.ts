import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MicrowaveThreeDimensionsComponent } from './microwave-three-dimensions/microwave-three-dimensions.component';
import { Microwave3DRoutingModule } from './microwave-3d-routing.module';

@NgModule({
  imports: [CommonModule, Microwave3DRoutingModule],
  declarations: [ MicrowaveThreeDimensionsComponent],
})
export class Microwave3DModule {}
