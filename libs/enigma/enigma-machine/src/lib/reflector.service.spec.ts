import { InvalidAlphabet } from '@enigma/enigma-utility';
import { ReflectorMapIndexToSameIndex, ReflectorService } from './reflector.service';

describe('ReflectorService', () => {
  it(`should thow an error if the alphabet is not complete or valid`, () => {
    expect(() => new ReflectorService('incorrect alphabet')).toThrowError(new InvalidAlphabet());
  });

  it(`should thow an error a letter is mapping to itself`, () => {
    expect(() => new ReflectorService('zabcdefghijklmnopqrstuvwxy')).not.toThrow();
    expect(() => new ReflectorService('zbacdefghijklmnopqrstuvwxy')).toThrowError(new ReflectorMapIndexToSameIndex());
  });

  it(`should be able to go through the rotor and get the relative index`, () => {
    // alphabet shifted by an offset of 1
    const reflectorConfig = `zabcdefghijklmnopqrstuvwxy`;

    const reflectorService: ReflectorService = new ReflectorService(reflectorConfig);

    // tslint:disable-next-line:no-magic-numbers
    expect(reflectorService.goThroughFromRelativeIndex(0)).toEqual(25);
    expect(reflectorService.goThroughFromRelativeIndex(1)).toEqual(0);
    // tslint:disable-next-line:no-magic-numbers
    expect(reflectorService.goThroughFromRelativeIndex(25)).toEqual(24);
  });
});
