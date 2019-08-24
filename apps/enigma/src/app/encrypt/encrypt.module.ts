import { NgModule } from '@angular/core';
import { CommonModule } from '../common/common.module';
import { RotorsModule } from '../rotors/rotors.module';
import { EncryptRoutingModule } from './encrypt-routing.module';
import { EncryptComponent } from './encrypt.component';

@NgModule({
  imports: [CommonModule, EncryptRoutingModule, RotorsModule],
  declarations: [EncryptComponent]
})
export class EncryptModule {}
