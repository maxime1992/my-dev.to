import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Timer } from '../../data/timer.interface';

@Component({
  selector: 'maxime1992-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent {
  @Input() public timer: Timer.AsObjectResolved | undefined;

  @Output() public removeTimer: EventEmitter<Timer.AsObjectResolved> = new EventEmitter();
  @Output() public toggleTimer: EventEmitter<Timer.AsObjectResolved> = new EventEmitter();

  public TimerStatus: typeof Timer.Status = Timer.Status;
}
