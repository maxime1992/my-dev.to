import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { MainEffects } from './data/main.effects';
import { MainPageComponent } from './feat/main-page/main-page.component';

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
];

@NgModule({
  declarations: [MainPageComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), EffectsModule.forFeature([MainEffects])],
})
export class MainModule {}
