import { TestBed } from '@angular/core/testing';

import { EnigmaBombeService } from './enigma-bombe.service';

describe('EnigmaBombeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnigmaBombeService = TestBed.get(EnigmaBombeService);
    expect(service).toBeTruthy();
  });
});
