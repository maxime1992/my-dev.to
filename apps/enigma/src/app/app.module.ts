import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from './common/common.module';

const routes: Routes = [
  {
    path: 'encrypt',
    loadChildren: () =>
      import('./encrypt/encrypt.module').then(m => m.EncryptModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    BrowserAnimationsModule,
    CommonModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
