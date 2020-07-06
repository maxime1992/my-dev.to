import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@common/rxjs-utility';
import { uuidV4Validator } from '@maxime1992/core-browser';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import { joinExistingGame } from '../../data/main.actions';

@Component({
  selector: 'maxime1992-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnDestroy {
  public gameIdFc: FormControl = new FormControl(null, uuidV4Validator());

  constructor(private store: Store<any>) {
    this.gameIdFc.valueChanges
      .pipe(
        filter(() => this.gameIdFc.valid),
        tap(id => this.store.dispatch(joinExistingGame(id))),
        takeUntilDestroyed(this),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {}
}
