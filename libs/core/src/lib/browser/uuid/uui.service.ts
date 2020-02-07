import { Injectable } from '@angular/core';
import * as uuid4 from 'uuid/v4';

@Injectable({ providedIn: 'root' })
export class UuidService {
  public getId<T extends string = string>(): T {
    return (uuid4() as unknown) as T;
  }
}
