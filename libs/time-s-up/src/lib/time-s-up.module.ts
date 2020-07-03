import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GamePageComponent } from './game/feat/game-page/game-page.component';
import { GameNotFoundComponent } from './game/ui/game-not-found/game-not-found.component';
import { GameComponent } from './game/ui/game/game.component';
import { ReadyForGameRoundComponent } from './game/ui/ready-for-game-round/ready-for-game-round.component';
import { SummaryGameRoundComponent } from './game/ui/summary-game-round/summary-game-round.component';
import { SummaryGameSleeveComponent } from './game/ui/summary-game-sleeve/summary-game-sleeve.component';
import { SummaryGameComponent } from './game/ui/summary-game/summary-game.component';
import { MainPageComponent } from './main/feat/main-page/main-page.component';
import { PartyPageComponent } from './party/feat/party-page/party-page.component';

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild([
      /* {path: '', pathMatch: 'full', component: InsertYourComponentHere} */
    ]),
  ],
  declarations: [
    MainPageComponent,
    PartyPageComponent,
    GamePageComponent,
    GameNotFoundComponent,
    ReadyForGameRoundComponent,
    GameComponent,
    SummaryGameRoundComponent,
    SummaryGameSleeveComponent,
    SummaryGameComponent,
  ],
})
export class TimeSUpModule {}
