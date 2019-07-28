import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EncryptComponent } from './encrypt.component';

const routes: Routes = [{ path: '', component: EncryptComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EncryptRoutingModule {}
