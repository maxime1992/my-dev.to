import { NgModule } from '@angular/core';
import { EncryptRoutingModule } from './encrypt-routing.module';
import { EncryptComponent } from './encrypt.component';
import { CommonModule } from '../common/common.module';

@NgModule({
  declarations: [EncryptComponent],
  imports: [CommonModule, EncryptRoutingModule]
})
export class EncryptModule {}
