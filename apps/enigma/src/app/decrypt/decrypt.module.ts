import { NgModule } from '@angular/core';
import { CommonModule } from '../common/common.module';
import { DecryptRoutingModule } from './decrypt-routing.module';
import { DecryptComponent } from './decrypt.component';

@NgModule({
  imports: [CommonModule, DecryptRoutingModule],
  declarations: [DecryptComponent]
})
export class DecryptModule {}
