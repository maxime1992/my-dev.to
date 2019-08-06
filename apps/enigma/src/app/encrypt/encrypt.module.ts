import { NgModule } from '@angular/core';
import { EncryptRoutingModule } from './encrypt-routing.module';
import { EncryptComponent } from './encrypt.component';
import { CommonModule } from '../common/common.module';
import { RotorsModule } from '../rotors/rotors.module';

@NgModule({
  imports: [CommonModule, EncryptRoutingModule, RotorsModule],
  declarations: [EncryptComponent]
})
export class EncryptModule {}
