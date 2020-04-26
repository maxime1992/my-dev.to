import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Microwave, MicrowaveAction, MicrowaveState, OneOfMicrowaveAction } from '@maxime1992/microwave';
import { Observable, Subject } from 'rxjs';
import { MicrowaveService } from '../microwave.service';

@Component({
  selector: 'maxime1992-microwave-container',
  templateUrl: './microwave-container.component.html',
  styleUrls: ['./microwave-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MicrowaveService],
})
export class MicrowaveContainerComponent implements OnDestroy {
  public actions$: Subject<OneOfMicrowaveAction> = new Subject();
  private microwaveBundle: Microwave = this.microwaveService.getMicrowave(this.actions$);
  public microwave$: Observable<MicrowaveState> = this.microwaveBundle.microwave$;
  public MicrowaveAction: typeof MicrowaveAction = MicrowaveAction;

  constructor(private microwaveService: MicrowaveService) {}

  public ngOnDestroy(): void {
    this.microwaveBundle.cleanUp();
  }
}
