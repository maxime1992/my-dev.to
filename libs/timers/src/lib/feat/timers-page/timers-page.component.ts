import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UuidService } from '@maxime1992/core-browser';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { Timer } from '../../data/timer.interface';
import { TimersService } from '../../data/timers.service';

@Component({
  templateUrl: './timers-page.component.html',
  styleUrls: ['./timers-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimersPageComponent {
  private static DEFAULT_TIMER_INTERVAL = 100;

  public timerIntervalFc: FormControl = new FormControl(TimersPageComponent.DEFAULT_TIMER_INTERVAL);

  private readonly timerIntervalUpdate$ = this.timerIntervalFc.valueChanges.pipe(startWith(this.timerIntervalFc.value));

  public timers$: Observable<Timer.TimerTimeElapsed[]> = this.timersService.getTimersWithTimeElapsed(
    this.timerIntervalUpdate$,
  );

  constructor(private timersService: TimersService, private uuidService: UuidService) {
    // add 3 timers by default
    this.addTimer();
    this.addTimer();
    this.addTimer();
  }

  public addTimer(): void {
    this.timersService.add({
      id: this.uuidService.getId(),
      startedAtMs: Date.now(),
      startedWithStatus: Timer.Status.STARTER,
    });
  }

  public removeTimer(timer: Timer.AsObject): void {
    this.timersService.remove({
      id: timer.id,
    });
  }

  public toggleTimer(timer: Timer.AsObject): void {
    this.timersService.toggle({
      id: timer.id,
      toggleAtMs: Date.now(),
    });
  }

  public trackById(index: number, item: Timer.AsObject): string {
    return item.id;
  }
}
