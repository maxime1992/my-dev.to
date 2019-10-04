import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThreeDimensionsComponent } from './three-dimensions/three-dimensions.component';

const routes: Routes = [
  {
    path: '',
    component: ThreeDimensionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThreeDimensionsRoutingModule {}
