import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GamePageComponent } from './feat/game-page/game-page.component';
import { GameNotFoundComponent } from './ui/game-not-found/game-not-found.component';
import { GameComponent } from './ui/game/game.component';
import { ReadyForGameRoundComponent } from './ui/ready-for-game-round/ready-for-game-round.component';
import { SummaryGameRoundComponent } from './ui/summary-game-round/summary-game-round.component';
import { SummaryGameSleeveComponent } from './ui/summary-game-sleeve/summary-game-sleeve.component';
import { SummaryGameComponent } from './ui/summary-game/summary-game.component';

@NgModule({
  declarations: [
    GamePageComponent,
    GameNotFoundComponent,
    ReadyForGameRoundComponent,
    GameComponent,
    SummaryGameRoundComponent,
    SummaryGameSleeveComponent,
    SummaryGameComponent,
  ],
  imports: [CommonModule, RouterModule.forChild([])],
})
export class GameModule {}
