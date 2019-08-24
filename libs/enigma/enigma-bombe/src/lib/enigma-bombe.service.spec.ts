import { TestBed } from '@angular/core/testing';
import { Letter } from '@enigma/enigma-utility';
import { EnigmaBombeService } from './enigma-bombe.service';

describe('EnigmaBombeService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [EnigmaBombeService]
    })
  );

  it('should be created', () => {
    const service: EnigmaBombeService = TestBed.get(EnigmaBombeService);
    expect(service).toBeTruthy();
  });

  it('should generate enigma combinations and attach a message to them', () => {
    const service: EnigmaBombeService = TestBed.get(EnigmaBombeService);
    const encryptedMessage = `idb pabc bf ki irjhdli mzi vl ddine ys rqoiclv va duwgz cg gvok dtyld`;
    const combinationsGenerator = service.getPossibleCombinationsWithEncryptedMessage(
      encryptedMessage
    );
    expect(combinationsGenerator.next()).toEqual({
      done: false,
      value: {
        encryptedMessage,
        initialRotorPosition: [Letter.Z, Letter.Z, Letter.Z]
      }
    });
    expect(combinationsGenerator.next()).toEqual({
      done: false,
      value: {
        encryptedMessage,
        initialRotorPosition: [Letter.A, Letter.A, Letter.A]
      }
    });
    expect(combinationsGenerator.next()).toEqual({
      done: false,
      value: {
        encryptedMessage,
        initialRotorPosition: [Letter.B, Letter.A, Letter.A]
      }
    });
  });
});
