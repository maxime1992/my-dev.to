import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatInputModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { TimersPageComponent } from './feat/timers-page/timers-page.component';
import { TimerComponent } from './ui/timer/timer.component';

const MATERIAL_MODULES: any[] = [MatButtonModule, MatInputModule, MatIconModule];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TimersPageComponent,
      },
    ]),
    ...MATERIAL_MODULES,
  ],
  declarations: [TimersPageComponent, TimerComponent],
})
export class TimersModule {}
