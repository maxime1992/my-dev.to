import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MicrowaveContainerComponent } from './microwave/microwave-container/microwave-container.component';
import { MicrowavePageComponent } from './microwave/microwave-page/microwave-page.component';
import { MicrowaveComponent } from './microwave/microwave/microwave.component';

@NgModule({
  declarations: [AppComponent, MicrowavePageComponent, MicrowaveComponent, MicrowaveContainerComponent],
  imports: [BrowserModule, RouterModule.forRoot([], { initialNavigation: 'enabled' })],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
