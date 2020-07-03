import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'maxime1992-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public title = 'time-s-up-app';
}
