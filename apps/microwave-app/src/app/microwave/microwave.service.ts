import { Injectable } from '@angular/core';
import { createMicrowave, Microwave, OneOfMicrowaveAction } from '@maxime1992/microwave';
import { Observable } from 'rxjs';

@Injectable()
export class MicrowaveService {
  public getMicrowave(action$: Observable<OneOfMicrowaveAction>): Microwave {
    return createMicrowave(action$);
  }
}
