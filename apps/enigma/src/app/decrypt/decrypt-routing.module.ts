import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecryptComponent } from './decrypt.component';

const routes: Routes = [{ path: '', component: DecryptComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DecryptRoutingModule {}
