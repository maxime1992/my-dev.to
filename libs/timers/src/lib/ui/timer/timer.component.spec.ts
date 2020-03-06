import { MatButton } from '@angular/material';
import { MatIcon } from '@angular/material/icon';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Timer } from '../../data/timer.interface';
import { TimerComponent } from './timer.component';

const timer: Readonly<Timer.AsObjectResolved> = {
  id: '',
  startedAtMs: 0,
  startedWithStatus: Timer.Status.STARTER,
  statusUpdatesAt: [],
  currentStatus: Timer.Status.STARTER,
  timeElapsedWhileStartedMs: 1,
};

describe('TimerComponent', () => {
  let spectator: SpectatorHost<TimerComponent>;
  const createHost = createHostFactory({
    component: TimerComponent,
    declarations: [MockComponent(MatIcon), MockDirective(MatButton)],
  });

  it(`should not have a 'stopped' class if the timer is currently started`, () => {
    spectator = createHost(`<mdt-timer [timer]="timer"></mdt-timer>`, {
      hostProps: {
        timer,
      },
    });

    (expect(spectator.query('*[data-time-elapsed]')) as any).not.toHaveClass('stopped');
  });

  it(`should have a 'stopped' class if the timer is currently stopped`, () => {
    spectator = createHost(`<mdt-timer [timer]="timer"></mdt-timer>`, {
      hostProps: {
        timer: {
          ...timer,
          currentStatus: Timer.Status.STOPPED,
        },
      },
    });

    (expect(spectator.query('*[data-time-elapsed]')) as any).toHaveClass('stopped');
  });

  it(`should have a pause icon if currently started`, () => {
    spectator = createHost(`<mdt-timer [timer]="timer"></mdt-timer>`, {
      hostProps: {
        timer: {
          ...timer,
          currentStatus: Timer.Status.STARTER,
        },
      },
    });

    (expect(spectator.query('*[data-play-pause-icon]')) as any).toHaveText('pause');
  });

  it(`should have a play icon if currently stopped`, () => {
    spectator = createHost(`<mdt-timer [timer]="timer"></mdt-timer>`, {
      hostProps: {
        timer: {
          ...timer,
          currentStatus: Timer.Status.STOPPED,
        },
      },
    });

    (expect(spectator.query('*[data-play-pause-icon]')) as any).toHaveText('play_arrow');
  });

  it(`should show the elapsed time in ms`, () => {
    spectator = createHost(`<mdt-timer [timer]="timer"></mdt-timer>`, {
      hostProps: {
        timer: {
          ...timer,
          timeElapsedMs: 10,
        },
      },
    });

    (expect(spectator.query('*[data-time-elapsed]')) as any).toHaveText('10');
  });
});
