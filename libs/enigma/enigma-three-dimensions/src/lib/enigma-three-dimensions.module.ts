import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThreeDimensionsRoutingModule } from './enigma-three-dimensions-routing.module';
import { ThreeDimensionsComponent } from './three-dimensions/three-dimensions.component';

@NgModule({
  imports: [CommonModule, ThreeDimensionsRoutingModule],
  declarations: [ThreeDimensionsComponent],
})
export class EnigmaThreeDimensionsModule {}
