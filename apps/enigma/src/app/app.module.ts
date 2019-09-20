import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CommonModule } from './common/common.module';

const routes: Routes = [
  {
    path: 'encrypt',
    loadChildren: () => import('./encrypt/encrypt.module').then(m => m.EncryptModule),
  },
  {
    path: 'decrypt',
    loadChildren: () => import('./decrypt/decrypt.module').then(m => m.DecryptModule),
  },
  {
    path: '**',
    redirectTo: 'encrypt',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', useHash: true }),
    BrowserAnimationsModule,
    CommonModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
