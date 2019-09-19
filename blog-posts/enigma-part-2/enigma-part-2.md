---
published: true
title: "Building an Enigma machine with only TypeScript and then use Angular DI system to properly instantiate it"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/enigma-part-2/assets/enigma-2-cover-image.png"
description: "[Part 2] - Building Enigma with TypeScript and Angular"
tags: cryptography, enigma, angular
series: "Enigma: Understand it, implement it, crack it"
canonical_url:
---

This blog post is the second of a series of 3, called **"Enigma: Understand it, implement it, crack it"**:

- 1 - [Enigma machine, how does the famous encryption device work?](https://dev.to/maxime1992/enigma-machine-how-does-the-famous-encryption-device-work-5aon)

- **2 - Building an Enigma machine with only TypeScript and then use Angular DI system to properly instantiate it _[this blog post]_**

- 3 - Brute-forcing an encrypted message from Enigma using the web worker API

# Table of contents

<!-- toc -->

- [Intro](#intro)
- [1 - Enigma library](#1-enigma-library)
  - [A - Reflector](#a-reflector)
  - [B - Rotor](#b-rotor)
  - [C - Machine](#c-machine)
- [2 - Enigma app](#2-enigma-app)
  - [A - Display the initial config rotors and current ones](#a-display-the-initial-config-rotors-and-current-ones)
  - [B - Encrypt a message from the app](#b-encrypt-a-message-from-the-app)
    - [B1 - Logic and template](#b1-logic-and-template)
    - [B2 - Create an Enigma machine using dependency injection](#b2-create-an-enigma-machine-using-dependency-injection)
- [Conclusion](#conclusion)
- [Found a typo?](#found-a-typo)

<!-- tocstop -->

If you find any typo please just make the edit yourself here: https://github.com/maxime1992/my-dev.to/blob/master/blog-posts/enigma-part-2/enigma-part-2.md and submit a pull request :ok_hand:

# Intro

In the [first blog post of this series](https://dev.to/maxime1992/enigma-machine-how-does-the-famous-encryption-device-work-5aon), we've seen the internal mechanism of Enigma. In this one, I'll explain how I decided to implement it.

The Enigma library I've built has nothing to do with Angular, it's just **pure TypeScript**. The reasons behind that are:

- It shouldn't in the first place because it could be used as a separate package with vanilla JS or any other framework
- [:warning: Spoiler alert :warning:] To crack Enigma in the next blog post of the series, we will use a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and importing anything from Angular within the worker context would break it as it's not aware of the DOM at all

BUT. For Angular lovers, worry no more. We will use Angular and especially its dependency injection API to build the UI that'll consume Enigma library.

**Note:** In order to correctly manage potential errors, the library does some checks (on the reflectors, the rotors, etc). Those checks have been skipped in the code examples to keep the main logic as small as possible. When that's the case, I've added a comment "`// [skipped] and the reason`" but feel free to check the complete source code here: https://github.com/maxime1992/my-dev.to/tree/master/libs/enigma/enigma-machine

# 1 - Enigma library

In order to build the machine, we will do so from bottom to top, which means starts with the reflector, then with the rotors and finally the machine itself.

## A - Reflector

_Reminder: a reflector is a simple map where an index is connected to another._

Multiple reflectors were available so the first thing to do is being able to set the reflector configuration. If we take the reflector called "Wide B": `yruhqsldpxngokmiebfzcwvjat` it means that `A` (index `0`) is mapping to `Y` (index `24`) and etc. So when someone types a letter on Enigma, it goes through the 3 rotors and after the last one, will go through the reflector. The rotor input might be at any index between `0` and `25` and we want to be able to find in a simple way the corresponding output:

```ts
export class ReflectorService {
  private reflectorConfig: number[] = [];

  constructor(reflectorConfig: string) {
    this.setReflectorConfig(reflectorConfig);
  }

  private setReflectorConfig(reflectorConfig: string): void {
    // [skipped] check that the reflector config is valid

    this.reflectorConfig = this.mapLetterToAbsoluteIndexInAlphabet(reflectorConfigSplit);

    // [skipped] check that every entry of the reflector maps to a different one
  }

  private mapLetterToAbsoluteIndexInAlphabet(alphabet: Alphabet): number[] {
    return alphabet.reduce((map: number[], letter: Letter, index: number) => {
      map[index] = getLetterIndexInAlphabet(letter);

      return map;
    }, []);
  }

  // ...
}
```

Now that we've remapped the string to an array that lets us find the output index for a given input, we need to expose a method so that the machine itself will be able to go through the rotor for a given index:

```ts
public goThroughFromRelativeIndex(index: number): number {
  return this.reflectorConfig[index];
}
```

As you can see, implementing the reflector was quite an easy task. Let's take a look to the rotors now.

## B - Rotor

_Reminder: a rotor consist of 2 disks connected together with wires. So for a given input index, the output could be the same as the input (in contrary to the reflector)._

For a given rotor, we express the rotor configuration with letters, just like we did for the reflector. For example, the first rotor has the following configuration: `ekmflgdqvzntowyhxuspaibrcj`. As a rotor will spin, instead of thinking with letters, I found it much easier to think of it and deal with it through **relative indexes**.

For example with the configuration above, we can represent it like the following:

```
a   b   c   d   ...  w   x   y   z   Alphabet...
|   |   |   |   ...  |   |   |   |   is remapped to...
e   k   m   f   ...  b   r   c   j   a new alphabet

But internally we want is as:

0   1   2   3   ...  22  23  24  25
|   |   |   |   ...  |   |   |   |
+4  +9  +10 +2  ...  +5  +20 +4  +10
```

```ts
export class EnigmaRotorService {
  private rotor: BiMap;
  private currentRingPosition = 0;

  constructor(rotorConfig: string, currentRingPosition: number = LetterIndex.A) {
    const rotorConfigSplit: string[] = rotorConfig.split('');

    // [skipped] check that the string is correctly mapping to alphabet

    this.rotor = createBiMapFromAlphabet(rotorConfigSplit);

    this.setCurrentRingPosition(currentRingPosition);
  }

  public setCurrentRingPosition(ringPosition: number): void {
    // [skipped] check that the ring position is correct

    this.currentRingPosition = ringPosition;
  }

  public getCurrentRingPosition(): number {
    return this.currentRingPosition;
  }

  // ...
}
```

The above implementation seems relatively small but what's the function `createBiMapFromAlphabet`? It's the function in charge of doing the remapping from a string to a bi map with relative indexes. The reason to have a bi map here is because we want to be able to go through the rotor from **left to right** and **right to left**. The challenge here is that we do not want to have to deal with negative indexes at any time. So if the current position of the rotor is `Z` and the relative input is `0`, we know that `Z --> J` with is equivalent to `index 25 --> +10`. On the contrary, when going from right to left, if we're on the letter `J` (index `10`) it's going to map to `Z` which won't be `-10` but `+17`. Here's the implementation:

```ts
export const createBiMapFromAlphabet = (alphabet: Alphabet): BiMap => {
  return alphabet.reduce(
    (map: BiMap, letter: Letter, index: number) => {
      const letterIndex: number = getLetterIndexInAlphabet(letter);
      map.leftToRight[index] = moduloWithPositiveOrNegative(ALPHABET.length, letterIndex - index);
      map.rightToLeft[letterIndex] = moduloWithPositiveOrNegative(ALPHABET.length, -(letterIndex - index));

      return map;
    },
    { leftToRight: [], rightToLeft: [] } as BiMap,
  );
};
```

Now, we've got 3 things left for the public API of the rotor:

- Being able to get the current position
- Being able to go through the rotor from left to right
- Being able to go through the rotor from right to left

```ts
public getCurrentRingPosition(): number {
  return this.currentRingPosition;
}

private goThroughRotor(
  from: 'left' | 'right',
  relativeIndexInput: number
): number {
  const currentRelativeIndexOutput = this.rotor[
    from === 'left' ? 'leftToRight' : 'rightToLeft'
  ][(this.currentRingPosition + relativeIndexInput) % ALPHABET.length];

  return (relativeIndexInput + currentRelativeIndexOutput) % ALPHABET.length;
}

public goThroughRotorLeftToRight(relativeIndexInput: number): number {
  return this.goThroughRotor('left', relativeIndexInput);
}

public goThroughRotorRightToLeft(relativeIndexInput: number): number {
  return this.goThroughRotor('right', relativeIndexInput);
}
```

Last remaining bit of the library: The machine itself!

## C - Machine

The machine is conducting the orchestra and making all letters of a message go through rotors/reflector/rotors plus spinning the rotors when needed. It has a public API to get/set the initial state of the rotors, get the current state of the rotors and encrypt/decrypt a message.

Let's look at first at how to keep track of the internal state for the rotors (initial and current state):

```ts
interface EnigmaMachineState {
  initialStateRotors: RotorsStateInternalApi;
  currentStateRotors: RotorsStateInternalApi;
}

export class EnigmaMachineService {
  private readonly state$: BehaviorSubject<EnigmaMachineState>;

  private readonly initialStateRotorsInternalApi$: Observable<
    RotorsStateInternalApi
  >;
  private readonly currentStateRotorsInternalApi$: Observable<
    RotorsStateInternalApi
  >;

  public readonly initialStateRotors$: Observable<RotorsState>;
  public readonly currentStateRotors$: Observable<RotorsState>;

  // ...
```

Using `Redux` for this class would be slightly overkill but reusing the concepts feels great. We use a `BehaviorSubject` to hold the whole state which is **immutable**. Easier to debug, easier to share as observables, it will also help for performance and let us set all our components to `ChangeDetectionStrategy.OnPush` :fire:.

I usually prefer to set all the properties directly but in our case, before setting them we want to make sure that the ones passed are correct and we make the checks + assignments in the constructor:

```ts
export class EnigmaMachineService {
  // ...
  constructor(private enigmaRotorServices: EnigmaRotorService[], private reflectorService: ReflectorService) {
    // [skipped] check that the rotor services are correctly defined

    // instantiating from the constructor as we need to check first
    // that the `enigmaRotorService` instances are correct
    const initialStateRotors: RotorsStateInternalApi = this.enigmaRotorServices.map(enigmaRotorService =>
      enigmaRotorService.getCurrentRingPosition(),
    ) as RotorsStateInternalApi;

    this.state$ = new BehaviorSubject({
      initialStateRotors,
      currentStateRotors: initialStateRotors,
    });

    this.initialStateRotorsInternalApi$ = this.state$.pipe(
      select(state => state.initialStateRotors),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.currentStateRotorsInternalApi$ = this.state$.pipe(
      select(state => state.currentStateRotors),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.initialStateRotors$ = this.initialStateRotorsInternalApi$.pipe(
      map(this.mapInternalToPublic),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.currentStateRotors$ = this.currentStateRotorsInternalApi$.pipe(
      map(this.mapInternalToPublic),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.currentStateRotorsInternalApi$
      .pipe(
        tap(currentStateRotors =>
          this.enigmaRotorServices.forEach((rotorService, index) =>
            rotorService.setCurrentRingPosition(currentStateRotors[index]),
          ),
        ),
        takeUntilDestroyed(this),
      )
      .subscribe();
  }
  // ...
}
```

Few things to note from the code above:

All the properties that we expose as observables are driven from our store (the only source of truth). Every time the current state changes, we set the rotors positions accordingly. We also keep track or the initial state and current state of the rotors in 2 different ways: One is `internal`, the other is not. For us, it's easier to deal with indexes instead of letters (internal) but when we expose them (to display in the UI for e.g.) we don't want the consumer to figure out that `18` stands for `s`, we just return `s`.

The other interesting part in the code above is the usage of `shareReplay` with the argument `{ bufferSize: 1, refCount: true }`. It'll allow us to share our observables instead of re-subscribing to them multiple times :+1:. Using `shareReplay(1)` would work but would be quite dangerous as if no one is listening anymore to the observable it wouldn't unsubscribe. That is why we need to pass `refCount` as `true`.

Now that we've seen how we share the state of our Enigma machine with the rest of the app, let see how the main part of the app works: Encoding a letter through the machine:

```ts
export class EnigmaMachineService {
  // ...
  private readonly encodeLetterThroughMachine: (letter: Letter) => Letter = flow(
    // the input is always emitting the signal of a letter
    // at the same position so this one is absolute
    getLetterIndexInAlphabet,
    this.goThroughRotorsLeftToRight,
    this.goThroughReflector,
    this.goThroughRotorsRightToLeft,
    getLetterFromIndexInAlphabet,
  );
  // ...
}
```

Is that... it? Yes! Pretty much.

In the above code, `flow` will run all those functions sequentially and pass to the next function the result of the previous one, which works quite nicely in this case as the result of the input (keyboard) goes to the first rotor, the result of the first rotor goes to the second rotor, etc.

Neat, right?

```ts
export class EnigmaMachineService {
  // ...

  private encryptLetter(letter: Letter): Letter {
    // [skipped] check that the letter is valid

    // clicking on a key of the machine will trigger the rotation
    // of the rotors so it has to be made first
    this.goToNextRotorCombination();

    return this.encodeLetterThroughMachine(letter);
  }

  public encryptMessage(message: string): string {
    this.resetCurrentStateRotorsToInitialState();

    return message
      .toLowerCase()
      .split('')
      .map(letter =>
        // enigma only deals with the letters from the alphabet
        // but in this demo, typing all spaces with an "X" would
        // be slightly annoying so devianting from original a bit
        letter === ' ' ? ' ' : this.encryptLetter(letter as Letter),
      )
      .join('');
  }

  private resetCurrentStateRotorsToInitialState(): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      currentStateRotors: [...state.initialStateRotors] as RotorsStateInternalApi,
    });
  }

  private goToNextRotorCombination(): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      currentStateRotors: goToNextRotorCombination(state.currentStateRotors),
    });
  }

  private goThroughRotorsLeftToRight(relativeInputIndex: number): number {
    return this.enigmaRotorServices.reduce(
      (relativeInputIndexTmp, rotorService) => rotorService.goThroughRotorLeftToRight(relativeInputIndexTmp),
      relativeInputIndex,
    );
  }

  private goThroughRotorsRightToLeft(relativeInputIndex: number): number {
    return this.enigmaRotorServices.reduceRight(
      (relativeInputIndexTmp, rotorService) => rotorService.goThroughRotorRightToLeft(relativeInputIndexTmp),
      relativeInputIndex,
    );
  }

  private goThroughReflector(relativeInputIndex: number): number {
    return this.reflectorService.goThroughFromRelativeIndex(relativeInputIndex);
  }

  public setInitialRotorConfig(initialStateRotors: RotorsState): void {
    const state: EnigmaMachineState = this.state$.getValue();

    this.state$.next({
      ...state,
      initialStateRotors: initialStateRotors.map(rotorState =>
        getLetterIndexInAlphabet(rotorState),
      ) as RotorsStateInternalApi,
    });
  }
}
```

In the above code, the most important bits are:

- `encryptLetter` calls `goToNextRotorCombination` first and then `encodeLetterThroughMachine`. It's what happened on the machine, every time a key was pressed, the rotors spin first and then we get the path for the new letter
- When calling `encryptMessage` we also call `resetCurrentStateRotorsToInitialState` because that method simulates every keystrokes by splitting the string into chars and calling `encryptLetter` on every one of them (which make the rotors move forward on every letter)
- `resetCurrentStateRotorsToInitialState`, `goToNextRotorCombination` and `setInitialRotorConfig` are updating the state in an immutable way
- `goThroughRotorsLeftToRight` and `goThroughRotorsRightToLeft` are respectively using `reduce` and `reduceRight` to go through the rotors left to right and right to left. Using `reduce*` here feels "natural" as from one rotor we go through the next one by passing the previous output

We've now built an Enigma library with a public API that should let us encrypt/decrypt messages in easy way. Let's now move on to the app itself.

# 2 - Enigma app

The goal is now to build the following:

![View of the app](./assets/encrypt-page.png 'View of the app')

We want to have:

- An initial config where we can set the rotors where Enigma should start
- Another display of the rotors but this time with the current state. Every time a new letter will be typed, the current state will update to show the new combination
- The text to encrypt/decrypt on the left (input) and the output on the right

## A - Display the initial config rotors and current ones

We can see that both the initial config and current state are the same so we will have a shared component containing the 3 letters.

I've decided to build that component using [ngx-sub-form](https://github.com/cloudnc/ngx-sub-form). If you're interested in that library you can read more on the Github project itself and in one of my previous posts here: https://dev.to/maxime1992/building-scalable-robust-and-type-safe-forms-with-angular-3nf9

`rotors-form.component.ts`

```ts
interface RotorsForm {
  rotors: RotorsState;
}

@Component({
  selector: 'app-rotors-form',
  templateUrl: './rotors-form.component.html',
  styleUrls: ['./rotors-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotorsFormComponent extends NgxAutomaticRootFormComponent<RotorsState, RotorsForm>
  implements NgxFormWithArrayControls<RotorsForm> {
  @DataInput()
  @Input('rotors')
  public dataInput: RotorsState | null | undefined;

  @Output('rotorsUpdate')
  public dataOutput: EventEmitter<RotorsState> = new EventEmitter();

  protected emitInitialValueOnInit = false;

  protected getFormControls(): Controls<RotorsForm> {
    return {
      rotors: new FormArray([]),
    };
  }

  protected transformToFormGroup(letters: RotorsState | null): RotorsForm {
    return {
      rotors: letters ? letters : [Letter.A, Letter.A, Letter.A],
    };
  }

  protected transformFromFormGroup(formValue: RotorsForm): RotorsState | null {
    return formValue.rotors;
  }

  protected getFormGroupControlOptions(): FormGroupOptions<RotorsForm> {
    return {
      validators: [
        formGroup => {
          if (
            !formGroup.value.rotors ||
            !Array.isArray(formGroup.value.rotors) ||
            formGroup.value.rotors.length !== NB_ROTORS_REQUIRED
          ) {
            return {
              rotorsError: true,
            };
          }

          return null;
        },
      ],
    };
  }

  public createFormArrayControl(
    key: ArrayPropertyKey<RotorsForm> | undefined,
    value: ArrayPropertyValue<RotorsForm>,
  ): FormControl {
    switch (key) {
      case 'rotors':
        return new FormControl(value, [Validators.required, containsOnlyAlphabetLetters({ acceptSpace: false })]);
      default:
        return new FormControl(value);
    }
  }
}
```

When using `ngx-sub-form`, we are able to provide data to a parent component without having it knowing anything about the form at all. In the case above we use the `rotorsUpdate` output. Internally, we manage everything through a `formGroup`. The view is also kept simple (and type safe!):

```html
<div [formGroup]="formGroup">
  <ng-container [formArrayName]="formControlNames.rotors">
    <span *ngFor="let rotor of formGroupControls.rotors.controls; let index = index">
      <mat-form-field>
        <input matInput [placeholder]="'Rotor ' + (index + 1)" [formControl]="rotor" maxlength="1" />
      </mat-form-field>
    </span>
  </ng-container>
</div>
```

Now, on the `rotors-initial-config` we have to retrieve the initial config from the machine and update that state when needed:

`rotors-initial-config.component.ts`

```ts
@Component({
  selector: 'app-rotors-initial-config',
  templateUrl: './rotors-initial-config.component.html',
  styleUrls: ['./rotors-initial-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotorsInitialConfigComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public initialStateRotors$: Observable<RotorsState> = this.enigmaMachineService.initialStateRotors$;

  public rotorsUpdate(rotorsConfiguration: RotorsState): void {
    // [skipped] check that the config is valid

    this.enigmaMachineService.setInitialRotorConfig(rotorsConfiguration);
  }
}
```

The view is as simple as:

```html
<app-rotors-form
  *ngIf="(initialStateRotors$ | async) as initialStateRotors"
  [rotors]="initialStateRotors"
  (rotorsUpdate)="rotorsUpdate($event)"
></app-rotors-form>
```

For the current state, even simpler. We just need to retrieve the current state from the machine.

`rotors-current-state.component.ts`

```ts
@Component({
  selector: 'app-rotors-current-state',
  templateUrl: './rotors-current-state.component.html',
  styleUrls: ['./rotors-current-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RotorsCurrentStateComponent {
  constructor(private enigmaMachineService: EnigmaMachineService) {}

  public currentStateRotors$: Observable<RotorsState> = this.enigmaMachineService.currentStateRotors$;
}
```

## B - Encrypt a message from the app

Now that we're able to display the rotors state, let's get started with the most important part of the app: The encryption of a message :raised_hands:!

### B1 - Logic and template

In order to keep things as minimal as possible with the examples, I've decided to remove everything from Angular Material in the following code and keep only what's important to understand the logic.

To get something that looks like the previous screenshot, we want to display for the rotors, the initial config, the current state, a text area for the text that will go through Enigma and another text area (disabled) that will show the output from Enigma.

Here's our template:

```html
<h1>Initial config</h1>
<app-rotors-initial-config></app-rotors-initial-config>

<h1>Current state</h1>
<app-rotors-current-state></app-rotors-current-state>

<textarea [formControl]="clearTextControl"></textarea>

<div *ngIf="clearTextControl.hasError('invalidMessage')">
  Please only use a-z letters
</div>

<textarea disabled [value]="encryptedText$ | async"></textarea>
```

Nothing magic or complicated in the above code but let's take a look at how we're going to implement the logic now:

```ts
@Component({
  selector: 'app-encrypt',
  templateUrl: './encrypt.component.html',
  styleUrls: ['./encrypt.component.scss'],
  providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncryptComponent {
  private initialStateRotors$: Observable<RotorsState> = this.enigmaMachineService.initialStateRotors$;

  public clearTextControl: FormControl = new FormControl('', containsOnlyAlphabetLetters({ acceptSpace: true }));

  private readonly clearTextValue$: Observable<string> = this.clearTextControl.valueChanges;

  public encryptedText$ = combineLatest([
    this.clearTextValue$.pipe(
      sampleTime(10),
      distinctUntilChanged(),
      filter(() => this.clearTextControl.valid),
    ),
    this.initialStateRotors$,
  ]).pipe(map(([text]) => this.enigmaMachineService.encryptMessage(text)));

  constructor(private enigmaMachineService: EnigmaMachineService) {}
}
```

_Have you seen the line `providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS]`? We'll get back to that in the next section!_

First thing to notice is that apart from the injected service and the `FormControl`, everything is a stream. Let's take the time to break down every properties.

Bind the observable containing the initial state of the rotors:

```ts
private initialStateRotors$: Observable<RotorsState> = this.enigmaMachineService.initialStateRotors$;
```

Create a `FormControl` to bind the value into the view and use a custom validator to make sure the letters used are valid. This will prevent us to pass invalid characters to Enigma:

```ts
public clearTextControl: FormControl = new FormControl(
  '',
  containsOnlyAlphabetLetters({ acceptSpace: true })
);
```

Finally, prepare an observable representing the output of Enigma for a given message. The output can vary based on 2 things:

- The input text
- The initial rotor state

```ts
public encryptedText$ = combineLatest([
  this.clearTextValue$.pipe(
    sampleTime(10),
    distinctUntilChanged(),
    filter(() => this.clearTextControl.valid)
  ),
  this.initialStateRotors$
]).pipe(map(([text]) => this.enigmaMachineService.encryptMessage(text)));
```

So we use the `combineLatest` operator to make sure that when any of the stream is updated we encrypt the message again with the new text and/or the new initial state.

### B2 - Create an Enigma machine using dependency injection

I mentioned at the beginning of the article that we would use the dependency injection mechanism provided by Angular. I also mentioned in the previous part that we'd come back to the line defined on the component:

```ts
providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS];
```

Now is a good time as the app is nearly ready, the last missing piece is just to create an Enigma machine. Instead of providing the service at a module level, we provide the service at a component level so that if we want to have multiple instances to work with multiple messages at the same time, we can.

Remember what the `EnigmaMachineService` takes as arguments? Here a little help:

```ts
constructor(
  private enigmaRotorServices: EnigmaRotorService[],
  private reflectorService: ReflectorService
)
```

In order to create an instance of the service within our `EncryptComponent` we could manually create a `ReflectorService`, manually create 3 `EnigmaRotorService` and manually create an `EnigmaMachineService` by providing as argument what we just created. Let's take a look how that'd look:

```ts
const reflectorService: ReflectorService = new ReflectorService();

const enigmaRotorService1: EnigmaRotorService = new EnigmaRotorService();
const enigmaRotorService2: EnigmaRotorService = new EnigmaRotorService();
const enigmaRotorService3: EnigmaRotorService = new EnigmaRotorService();

const enigmaMachineService: EnigmaMachineService = new EnigmaMachineService(
  [enigmaRotorService1, enigmaRotorService2, enigmaRotorService3],
  reflectorService,
);
```

But...

- Should that responsibility belong to the `EncryptComponent`?
- How would we be able to later test the `EncryptComponent` with mocked data for example?
- What if we want to be able to customize the rotors and reflector on a component basis?
- What if we want to be able to add or remove rotors on a component basis?

All the above would be really hard to achieve. If we use dependency injection on the other hand, it'd be quite simple. The idea being: Let someone else be in charge of creating those services while still being able to customize how we create them at the `providers` level.

So all we want in the end is to just ask Angular to give us an instance of `EnigmaMachineService` through dependency injection:

```ts
export class EncryptComponent {
  // ...
  constructor(private enigmaMachineService: EnigmaMachineService) {}
  // ...
}
```

But hold on. How can that even work? Our `EnigmaMachineService` is a simple class and we do not have a `@Injectable()` decorator. So we can't just specify the service into the provider array and inject it through the constructor as we'd usually do. Angular DI system got us covered :ok_hand:.

Let's take a closer look at the following line:

```ts
providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS];
```

Here's the `DEFAULT_ENIGMA_MACHINE_PROVIDERS` constant:

```ts
export const ROTORS: InjectionToken<EnigmaRotorService[]> = new InjectionToken<
  EnigmaRotorService[]
>('EnigmaRotorServices');

export const getReflectorService = (reflector: string) => {
  return () => new ReflectorService(reflector);
};

export const getRotorService = (rotor: string) => {
  return () => new EnigmaRotorService(rotor);
};

export const getEnigmaMachineService = (
  rotorServices: EnigmaRotorService[],
  reflectorService: ReflectorService
) => {
  return new EnigmaMachineService(rotorServices, reflectorService);
};

export const DEFAULT_ENIGMA_MACHINE_PROVIDERS: (
  | Provider
  | FactoryProvider)[] = [
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService((`ekmflgdqvzntowyhxuspaibrcj`)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(`ajdksiruxblhwtmcqgznpyfvoe`)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(`fvpjiaoyedrzxwgctkuqsbnmhl`)
  },
  {
    provide: ReflectorService,
    useFactory: getReflectorService('yruhqsldpxngokmiebfzcwvjat')
  },
  {
    provide: EnigmaMachineService,
    deps: [ROTORS, ReflectorService],
    useFactory: getEnigmaMachineService
  }
];
```

It's a lot to take in :scream:! Once again, let's break it down, piece by piece.

The first thing we want to do is create an [injection token](https://angular.io/api/core/InjectionToken) that will represent the array of rotors we want to use:

```ts
export const ROTORS: InjectionToken<EnigmaRotorService[]> = new InjectionToken<EnigmaRotorService[]>(
  'EnigmaRotorServices',
);
```

Then, we create functions that will be used as `factories`. Which means that they will be used to create instances (in that case, instances of classes):

```ts
export const getReflectorService = (reflector: string) => {
  return () => new ReflectorService(reflector);
};

export const getRotorService = (rotor: string) => {
  return () => new EnigmaRotorService(rotor);
};

export const getEnigmaMachineService = (rotorServices: EnigmaRotorService[], reflectorService: ReflectorService) => {
  return new EnigmaMachineService(rotorServices, reflectorService);
};
```

The reason we will need factories is because all the classes we will be creating require arguments and because we're not using the `@Injectable` decorator on those classes. So Angular cannot instantiate them magically for us, we need to do it ourselves.

After that, we create an array that will be used by the `providers` property of the component and it'll contain the services. Let's start with the creation of the 3 rotors:

```ts
[
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService((`ekmflgdqvzntowyhxuspaibrcj`)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(`ajdksiruxblhwtmcqgznpyfvoe`)
  },
  {
    provide: ROTORS,
    multi: true,
    useFactory: getRotorService(`fvpjiaoyedrzxwgctkuqsbnmhl`)
  },
  // ...
]
```

With Angular DI system, we can either pass a service decorated with the `@Injectable` decorator or pass an object to be more specific. You can learn more about Angular's DI system here: https://angular.io/guide/dependency-injection

The interesting part in that case is that we're using the `multi` and `useFactory` properties. The above code says: "Register in the `ROTORS` token array every rotor I will give you". Instead of having `ROTORS` as a single value, thanks to the `multi: true` property it will now be an array. Then, we use the factory we've defined earlier by passing as a parameter the rotor configuration.

Then we've got the `ReflectorService` with nothing particular on that one:

```ts
[
  // ...
  {
    provide: ReflectorService,
    useFactory: getReflectorService('yruhqsldpxngokmiebfzcwvjat'),
  },
  // ...
];
```

And finally, the `EnigmaMachineService` that will pass to the factory some arguments: The freshly created rotors and the reflector:

```ts
  // ...
  {
    provide: EnigmaMachineService,
    deps: [ROTORS, ReflectorService],
    useFactory: getEnigmaMachineService
  },
  // ...
```

With the `deps` property, we let Angular know that when calling the `getEnigmaMachineService` it will have to provide those dependencies.

Last but not least, I want to get your attention on the fact that the factories are returning a function in charge of creating the class and not directly an instance of the class. Why? Because it'll leverage the fact that a service needs to be created only when it's required, not before. Example: Defining a service in the `providers` array of a module won't create the service. The service will only be instantiated once a component or another service requires it.

# Conclusion

Within this blog post we've seen one possible implementation with TypeScript of a real machine used during WW2 to send secret messages. We've also seen how it's possible to properly consume a non-angular library into our Angular app thanks to the dependency injection mechanism provided by Angular.

I've had a lot of fun building the Enigma library and the Angular app and I hope had some too while reading this blog post! :smile:  
I'd be delighted to see another implementation of Enigma so if you manage to build your own version let me know in the comments section :point_down:.

Next and final article of the series will be about **cracking an encrypted message from Enigma without knowing the initial rotors position FROM THE BROWSER**.

Stay tuned and thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
