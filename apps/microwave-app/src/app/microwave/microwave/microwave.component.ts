import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EMicrowaveAction, MicrowaveState } from '@maxime1992/microwave';

@Component({
  selector: 'maxime1992-microwave',
  templateUrl: './microwave.component.html',
  styleUrls: ['./microwave.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MicrowaveComponent {
  @Input() public microwave: MicrowaveState | undefined;

  // start and stop are native events so
  // we prefix all of them with nw for consistency
  @Output() public mwStart: EventEmitter<void> = new EventEmitter();
  @Output() public mwStop: EventEmitter<void> = new EventEmitter();
  @Output() public mwReset: EventEmitter<void> = new EventEmitter();
  @Output() public mwAddTimeMs: EventEmitter<number> = new EventEmitter();

  public EMicrowaveAction: typeof EMicrowaveAction = EMicrowaveAction;
}
