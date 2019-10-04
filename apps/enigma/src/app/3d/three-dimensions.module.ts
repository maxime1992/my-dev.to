import { NgModule, Component } from '@angular/core';
// import { EnigmaThreeDimensionsModule } from '@enigma/three-dimensions';
import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'tmp',
//   template: '<router-outlet></router-outlet>',
// })
// class Tmp {}

@NgModule({
  imports: [
    // EnigmaThreeDimensionsModule,
    RouterModule.forChild([
      { path: '', loadChildren: () => import('@enigma/three-dimensions').then(m => m.EnigmaThreeDimensionsModule) },
    ]),
  ],
})
export class ThreeDimensionsModule {}
