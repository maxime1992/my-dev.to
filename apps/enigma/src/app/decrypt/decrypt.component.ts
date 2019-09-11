import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { ConfigurationToDecrypt, EnigmaBombeService } from '@enigma/enigma-bombe';
import { fromWorkerPool } from 'observable-webworker';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { filter, map, mapTo, shareReplay, skip, startWith, switchMap, takeWhile, timestamp } from 'rxjs/operators';
import { DEFAULT_ENIGMA_MACHINE_PROVIDERS } from '../common/enigma-machine';
import { containsOnlyAlphabetLetters } from '../common/validators';

interface DecryptedBundle {
  message: string | null;
  index: number;
}

// @todo move to a utility shared lib
enum Status {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}

@Component({
  selector: 'app-decrypt',
  templateUrl: './decrypt.component.html',
  styleUrls: ['./decrypt.component.scss'],
  providers: [
    ...DEFAULT_ENIGMA_MACHINE_PROVIDERS,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    EnigmaBombeService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecryptComponent {
  public encryptedTextControl: FormControl = new FormControl('', containsOnlyAlphabetLetters({ acceptSpace: true }));

  public encryptedText$: Observable<string> = combineLatest([
    this.encryptedTextControl.valueChanges,
    this.encryptedTextControl.statusChanges,
  ]).pipe(
    map(([message, status]: [string, Status]) =>
      status !== Status.VALID
        ? // if the message is not valid we want to clear
          //  the decrypted text as it's outdated
          ''
        : message.trim(),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private decryptedBundle$: Observable<DecryptedBundle | null> = this.encryptedText$.pipe(
    switchMap(msg =>
      !msg
        ? of(null)
        : this.decryptMessage(msg).pipe(
            map((message, index) => ({ message, index })),
            takeWhile(({ message }) => !message, true),
          ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public combinationsTried$: Observable<number> = this.encryptedText$.pipe(
    switchMap(() =>
      this.decryptedBundle$.pipe(
        skip(1),
        map(decryptedBundle => (!decryptedBundle ? 1 : decryptedBundle.index + 1)),
        startWith(0),
      ),
    ),
  );

  public elapsedTime$: Observable<number> = this.encryptedText$.pipe(
    timestamp(),
    switchMap(({ timestamp: initialTimestamp }) =>
      this.decryptedBundle$.pipe(
        timestamp(),
        map(({ timestamp: currentTimestamp }) => currentTimestamp - initialTimestamp),
      ),
    ),
  );

  public decryptedText$ = merge(
    // whenever the encrypted text changes, reset the decrypted text
    this.encryptedText$.pipe(mapTo('')),
    // but as soon as we receive the decrypted text, return it
    this.decryptedBundle$.pipe(
      filter(decryptedBundle => !!decryptedBundle && !!decryptedBundle.message),
      map(decryptedBundle => !!decryptedBundle && decryptedBundle.message),
    ),
  );

  constructor(private enigmaBombeService: EnigmaBombeService) {}

  private decryptMessage(encryptedMessage: string): Observable<string> {
    // the following should be done transparently by the `EnigmaBombeService`
    // but due to the following issue it's not possible (yet?)
    // https://github.com/angular/angular-cli/issues/15059
    return fromWorkerPool<ConfigurationToDecrypt, string>(
      () =>
        // https://github.com/angular/angular-cli/issues/15576
        // prettier-ignore
        new Worker('./enigma-bombe.worker', {
          name: 'enigma-worker',
          type: 'module'
        }),
      this.enigmaBombeService.getPossibleCombinationsWithEncryptedMessage(encryptedMessage),
    );
  }
}
