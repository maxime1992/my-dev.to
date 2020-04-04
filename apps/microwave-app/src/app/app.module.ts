import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [{ path: '', loadChildren: () => import('@maxime1992/microwave-3d').then(m => m.Microwave3DModule) }],
      { initialNavigation: 'enabled' },
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
