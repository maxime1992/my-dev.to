import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameModule } from './game/game.module';
import { MainModule } from './main/main.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => MainModule,
    pathMatch: 'full',
  },
  {
    path: 'game',
    loadChildren: () => GameModule,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MainModule, GameModule],
})
export class TimeSUpModule {}
