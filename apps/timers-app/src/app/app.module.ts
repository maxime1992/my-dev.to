import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const MATERIAL_MODULES = [MatToolbarModule];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () => import('@mdt/timers').then(m => m.TimersModule),
        },
      ],
      {
        initialNavigation: 'enabled',
      },
    ),
    ...MATERIAL_MODULES,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
