import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeDimensionsComponent } from './three-dimensions/three-dimensions.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ThreeDimensionsComponent],
  exports: [ThreeDimensionsComponent],
})
export class EnigmaThreeDimensionsModule {}
