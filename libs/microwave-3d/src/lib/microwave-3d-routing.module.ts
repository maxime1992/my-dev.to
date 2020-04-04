import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MicrowaveThreeDimensionsComponent } from './microwave-three-dimensions/microwave-three-dimensions.component';

const routes: Routes = [
  {
    path: '',
    component: MicrowaveThreeDimensionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Microwave3DRoutingModule {}
