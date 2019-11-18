import { Injectable } from '@angular/core';
import { arrayDiff, ArrayDiff } from '@common/object-utility';
import { BehaviorSubject, from, Observable } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  pairwise,
  shareReplay,
  startWith,
  take,
  takeUntil,
  skip,
  tap,
} from 'rxjs/operators';
import { Rotor3dService } from './rotor-3d.service';
import { RotorConf, ThreeDimensionsEnvConf } from './scene-state.interface';

export const select = <T, U>(selector: (state: T) => U) => (obs$: Observable<T>): Observable<U> =>
  obs$.pipe(
    map(selector),
    distinctUntilChanged(),
  );

@Injectable({
  providedIn: 'root',
})
export class SceneStateService {
  private threeDimensionsEnvConf$$: BehaviorSubject<ThreeDimensionsEnvConf> = new BehaviorSubject({
    rotors: [] as RotorConf[],
    rotorMaterial: {
      alpha: 0.5,
    },
  });

  private threeDimensionsEnvConf$: Observable<ThreeDimensionsEnvConf> = this.threeDimensionsEnvConf$$.pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private rotors$: Observable<RotorConf[]> = this.threeDimensionsEnvConf$.pipe(
    select(a => a.rotors),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private rotorsDiff$: Observable<ArrayDiff<RotorConf>> = this.rotors$.pipe(
    startWith(null),
    pairwise(),
    map(([rotorsPrevious, rotorsCurrent]) => {
      if (!rotorsPrevious && rotorsCurrent) {
        return arrayDiff([], rotorsCurrent, x => x.id);
      }

      if (!rotorsPrevious || !rotorsCurrent) {
        throw new Error('Invalid rotors state');
      }

      return arrayDiff(rotorsPrevious, rotorsCurrent, r => r.id);
    }),
    tap(x => console.log('diffffffff', x)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private rotorAdded$: Observable<RotorConf> = this.rotorsDiff$.pipe(
    concatMap(rotorsDiff => from(rotorsDiff.added)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private rotorRemoved$: Observable<RotorConf> = this.rotorsDiff$.pipe(
    concatMap(rotorsDiff => from(rotorsDiff.deleted)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private rotorUpdated$: Observable<RotorConf> = this.rotorsDiff$.pipe(
    concatMap(rotorsDiff => from(rotorsDiff.unchanged)),
    shareReplay({ bufferSize: 1, refCount: true }),
    tap(x => console.log('updated!!!!', { id: x.id, z: x.position.z })),
  );

  // @todo this shouldn't be public
  public handleRotor$ = this.rotorAdded$.pipe(
    mergeMap(rotorAdded =>
      this.rotor3DService
        .createRotor(
          rotorAdded,
          this.rotorUpdated$.pipe(
            filter(r => r.id === rotorAdded.id),
            // skip(1),
          ),
        )
        .pipe(
          takeUntil(
            this.rotorRemoved$.pipe(
              filter(r => r.id === rotorAdded.id),
              take(1),
            ),
          ),
        ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(private rotor3DService: Rotor3dService) {}

  public addRotor(rotorsRelativePositions: number[]): void {
    const newRotorsPositions: number[] = this.computeRotorsZPositions(
      this.threeDimensionsEnvConf$$.value.rotors.length + 1,
      0.5,
    );

    console.log(newRotorsPositions);

    const newLocal = {
      ...this.threeDimensionsEnvConf$$.value,
      rotors: [
        ...this.threeDimensionsEnvConf$$.value.rotors.map((rotor, index) => ({
          ...rotor,
          position: { ...rotor.position, z: newRotorsPositions[index] },
        })),
        {
          // @todo use UUID
          id: Math.random() + ``,
          position: {
            z: newRotorsPositions[this.threeDimensionsEnvConf$$.value.rotors.length],
          },
        },
      ],
    };

    console.log('fresh', newLocal.rotors.map(x => x.position.z));

    this.threeDimensionsEnvConf$$.next(newLocal);
  }

  private computeRotorsZPositions(nbValues: number, step: number): number[] {
    if (nbValues % 2 === 0) {
      const start = -((nbValues / 2 - 1) * step + step / 2);
      return Array.from({ length: nbValues }).map((_, index) => start + index * step);
    } else {
      const start = -(((nbValues - 1) / 2) * step);
      return Array.from({ length: nbValues }).map((_, index) => start + index * step);
    }
  }
}
