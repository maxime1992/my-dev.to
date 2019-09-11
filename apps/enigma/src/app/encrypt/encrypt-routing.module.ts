import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncryptComponent } from './encrypt.component';

const routes: Routes = [{ path: '', component: EncryptComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncryptRoutingModule {}
