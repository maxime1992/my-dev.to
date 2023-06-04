---
published: true
title: 'Brute-forcing an encrypted message from Enigma using the web worker API'
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/enigma-part-3/assets/enigma-3-cover-image.png"
description: '[Part 3] - Brute-forcing an encrypted message from Enigma using the web worker API'
tags: cryptography, enigma, angular
series: 'Enigma: Understand it, implement it, crack it'
canonical_url:
---

This blog post is the last of a series of 3, called **"Enigma: Understand it, implement it, crack it"**:

- 1 - [Enigma machine, how does the famous encryption device work?](https://dev.to/maxime1992/enigma-machine-how-does-the-famous-encryption-device-work-5aon)

- 2 - [Building an Enigma machine with only TypeScript and then use Angular DI system to properly instantiate it](https://dev.to/maxime1992/building-an-enigma-machine-with-only-typescript-and-then-use-angular-di-system-to-properly-instantiate-it-2e2h)

- **3 - Brute-forcing an encrypted message from Enigma using the web worker API _[this blog post]_**

# Table of contents

<!-- toc -->

- [Intro](#intro)
- [1 - How to detect if a message has been found for one rotor combination?](#1-how-to-detect-if-a-message-has-been-found-for-one-rotor-combination)
- [2 - Lazily generate every Enigma's rotors combinations using a generator](#2-lazily-generate-every-enigmas-rotors-combinations-using-a-generator)
- [3 - Brute force the encrypted message using all the cores with a pool of web workers managed as an RxJs stream](#3-brute-force-the-encrypted-message-using-all-the-cores-with-a-pool-of-web-workers-managed-as-an-rxjs-stream)
- [4 - Build a UI to decrypt an encoded message with the number of attempts and time taken](#4-build-a-ui-to-decrypt-an-encoded-message-with-the-number-of-attempts-and-time-taken)
- [Conclusion](#conclusion)
- [Found a typo?](#found-a-typo)

<!-- tocstop -->

If you find any typo please just make the edit yourself here: https://github.com/maxime1992/my-dev.to/blob/master/blog-posts/enigma-part-3/enigma-part-3.md and submit a pull request :ok_hand:

# Intro

During World War II, one of the most valuable assets was communications intelligence. Being able to speak with only your allies and being able to listen your enemies without them noticing was priceless. Alan Turing and many other people managed to read encrypted messages from Enigma using a machine called "The Bombe":

![The Bombe](./assets/the-bombe.jpg 'The Bombe')

_The Bombe - Image from https://www.cryptomuseum.com_

That machine was built with 36 Enigma machines to try all the combinations for a given message until you found out from the encrypted message, the original one.

Today, we're going to build an equivalent of that machine using [TypeScript](http://www.typescriptlang.org) and [Angular](https://angular.io) :raised_hands:.

The most complicated part of the series has probably been to build Enigma.  
Trying to brute force an Enigma message is probably the funniest one, so let's get to it :smile:!

_I've written the URL of the demo in the conclusion but I'd recommend to give it a go after reading._

# 1 - How to detect if a message has been found for one rotor combination?

As you know by now, the main idea is to try all the different combinations of Enigma until we find the original version of an encrypted message. If you've read the [first article](https://dev.to/maxime1992/enigma-machine-how-does-the-famous-encryption-device-work-5aon) of the series, you know that with 3 rotors we've got **17576 possible combinations**. So we clearly don't want to have to read all of them to know which message is the original one :scream:.

In order to tackle that first challenge, I've decided to use a dictionary :closed_book:. Then, for every word of a potentially decrypted message check if the word is into the dictionary. When we reach a given threshold, we consider that the message has been found.

Here's the actual implementation:

```ts
const wordMinLength = 3;
const thresholdWordsFoundToBeConsideredEnglishWord = 3;

export class EnigmaDecryptService {
  // ...

  private getMessageIfEnglish(decryptedMessage: string): string | null {
    const decryptedMessageWords = decryptedMessage.split(' ');
    let foundWordsCounter = 0;

    for (let index = 0; index < decryptedMessageWords.length; index++) {
      const element = decryptedMessageWords[index];

      if (element.length > wordMinLength && WORDS.has(element)) {
        foundWordsCounter++;
      }

      if (foundWordsCounter >= thresholdWordsFoundToBeConsideredEnglishWord) {
        return decryptedMessage;
      }
    }

    return null;
  }
}
```

Note: `WORDS` is a `Set` of words that I've found on Github. It was originally an `Array` but I've transformed it to a `Set` so that checking if a word is into the dictionary is lightning fast :zap:.

Now that we're able to detect if a message is an English one, let see how to generate all the different combinations of Enigma before trying them on the encrypted message.

# 2 - Lazily generate every Enigma's rotors combinations using a generator

Have you ever heard of **[generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Generator_functions)** in Javascript? A generator lets you create an [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators) from a function. It means that you will be able to either manually call `next` to get the next value or loop over the values, just like you would with an array.

Here's a very simple demo of a generator taken from [https://developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Generator_functions):

```ts
function* makeRangeIterator(start = 0, end = 100, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}
```

2 things to notice here:

- The use of the `*` after the `function` keyword
- The `yield` keyword

The `*` is here to declare that this function is a generator. Simple!  
The `yield` is here to return a value. Simple too! :raised_hands:

Then we can loop over it:

```ts
// will display numbers from 0 to 99 included
for (let value of makeRangeIterator()) {
  console.log(value);
}
```

But why wouldn't we just use an `Array` for that?

```ts
const values = Array.from({ length: 100 }).map((x, index) => index);

for (let value of values) {
  console.log(value);
}
```

That'd work too! But there's a big difference. Can you spot it?

The generator is **lazy**. It means that the values are produced only when needed in contrary to the `Array` that we have to create beforehand and **hold into the memory**. We had 100 items to display here which is fine, but what if it was 10.000? Or 1 billion elements? Or even... An infinite number :open_mouth:? Generators are here for that.

Within the [Part II](https://dev.to/maxime1992/building-an-enigma-machine-with-only-typescript-and-then-use-angular-di-system-to-properly-instantiate-it-2e2h) of the Enigma's series we've used a function [`goToNextRotorCombination`](https://github.com/maxime1992/my-dev.to/blob/f082a4a135c1f8852222facfa02f2e7c55b6fa34/libs/enigma/enigma-machine/src/lib/rotor.ts#L88) and if we pass `[0, 0, 0]` (which represents `['A', 'A', 'A']`) it'd return `[1, 0, 0]` which is the next combination.

Let's look at the implementation:

```ts
export class EnigmaBombeService {
  // ...

  private *getPossibleCombinations(): IterableIterator<RotorsState> {
    let rotorCombination: RotorsStateInternalApi = [LetterIndex.Z, LetterIndex.Z, LetterIndex.Z];

    do {
      const combination = rotorCombination.map(rotorState => getLetterFromIndexInAlphabet(rotorState)) as RotorsState;

      yield combination;

      rotorCombination = goToNextRotorCombination(rotorCombination) as RotorsStateInternalApi;
    } while (
      rotorCombination[INDEX_ROTOR_0] !== LetterIndex.Z ||
      rotorCombination[INDEX_ROTOR_1] !== LetterIndex.Z ||
      rotorCombination[INDEX_ROTOR_2] !== LetterIndex.Z
    );
  }
}
```

Pretty simple, isn't it?

We start from `[25, 25, 25]` which represents `['Z', 'Z', 'Z']` as when we type a letter the rotors are spinning first. So the first combination that'll be run is `['A', 'A', 'A']`. Then we loop until we reach the initial combination and `yield` every possible combination in between.

# 3 - Brute force the encrypted message using all the cores with a pool of web workers managed as an RxJs stream

We're now able to find out if a given message is an English one, generate all the possible combinations and (from [Part II](https://dev.to/maxime1992/building-an-enigma-machine-with-only-typescript-and-then-use-angular-di-system-to-properly-instantiate-it-2e2h)) create an Enigma machine. What we want to do next is to try on one encrypted message all the different combinations that we've generated. In order to do that as efficiently as possible, we'll discover a way of dealing with multiple threads in Javascript: **[web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)** :fire:.

Web workers are using a message pattern where on both sides (current thread and the one in the web worker), you can either subscribe to a given message or send one. As Angular and RxJs lovers, how cool do you think it'd be to have an interface letting us dealing with web workers as if they were... **Streams**? :neckbeard:

Let your inner **[Rob Wormald](https://twitter.com/robwormald)** guide you here:

![Everything is a stream](./assets/everything-is-a-stream.jpeg 'Everything is a stream')

_Picture taken from a talk by Rob Wormald that is very inspiring and I'd recommend to watch https://www.youtube.com/watch?v=UHI0AzD_WfY_

Hopefully, one of my colleagues ([Zak Henry](https://dev.to/zakhenry)) at [CloudNC](https://cloudnc.com) has made that task a breeze. Really. He created and open sourced a great library that not only manages all the reactive bindings for us between the main thread and the web workers but also allows us to automatically take as many resources as possible. All that, through streams :pray:.

Here's the main idea of what we're going to build:

![Enigma s generator and workers pool manager](./assets/enigma-s-generator-and-workers-pool-manager.jpg 'Enigma s generator and workers pool manager')

The library I mentioned above is called **[observable-webworker](https://github.com/cloudnc/observable-webworker)**. Best part?  
**It's framework agnostic so you could also use it with React, Vue, etc.**

Only 2 inputs are needed for the library to work: A workload, which can be either an `Observable`, an `Array`, or an `Iterable` (a generator for e.g.). Second one is the `Worker` itself. From that, we get a stream with all the values coming back from all the workers, in parallel :fire:.

Also, did I forget to mention that as soon as you unsubscribe from the output stream it'll kill all the web workers?

![Thumb up](./assets/brent-rambo.png 'Thumb up')

> Enough talking, show me the code!

`apps/enigma/src/app/decrypt/enigma-bombe.worker.ts`:

```ts
// all the following is part of a web worker so we're not into
// an Angular context anymore and we don't have any DI here
// we need to manually instantiate the required classes

@ObservableWorker()
export class EnigmaBombeWorker implements DoWorkUnit<ConfigurationToDecrypt, string | null> {
  private enigmaDecryptService: EnigmaDecryptService;

  constructor() {
    const enigmaRotorServices = [
      // by default we use the first 3 rotors
      EnigmaRotorService.ROTOR_1,
      EnigmaRotorService.ROTOR_2,
      EnigmaRotorService.ROTOR_3,
    ].map(rotorConfig => new EnigmaRotorService(rotorConfig));

    const reflectorService = new ReflectorService(
      // by default we use the first reflector, also called "Wide B"
      ReflectorService.REFLECTOR_1,
    );

    const enigmaMachineService: EnigmaMachineService = new EnigmaMachineService(enigmaRotorServices, reflectorService);

    this.enigmaDecryptService = new EnigmaDecryptService(enigmaMachineService);
  }

  public workUnit(input: ConfigurationToDecrypt): Observable<string | null> {
    return of(
      this.enigmaDecryptService.decryptMessageFor1Combination(input.initialRotorPosition, input.encryptedMessage),
    );
  }
}
```

Here's what's happening in the above code:

- Use the `@ObservableWorker()` decorator provided by the library
- Create one Enigma machine for the web worker
- Implement the `workUnit` method required by the library where we just try one combination on the machine for a given message. If the message is the English one then we return it otherwise we return `null`

Then from our component, whenever the input changes we get a new stream to decrypt the new message.

`apps/enigma/src/app/decrypt/decrypt.component.ts`:

```ts
@Component({
  // ...
})
export class DecryptComponent {
  // ...

  private decryptMessage(encryptedMessage: string): Observable<string> {
    return fromWorkerPool<ConfigurationToDecrypt, string>(
      () =>
        new Worker('./enigma-bombe.worker', {
          name: 'enigma-worker',
          type: 'module',
        }),
      this.enigmaBombeService.getPossibleCombinationsWithEncryptedMessage(encryptedMessage),
    );
  }
}
```

# 4 - Build a UI to decrypt an encoded message with the number of attempts and time taken

Now that we've got everything ready to brute force an encrypted message, we want to see in the previous component (`DecryptComponent`) what else is there. But first, let's look at the final output:

![Decrypting](./assets/decrypting.png 'Decrypting')

_:point_up: While decrypting a message_

![Decrypting](./assets/decrypted.png 'Decrypting')

_:point_up: Once a message has been found_

Before we get into the code, let's think about the workflow we're trying to achieve here:

- Enter an encrypted message on the left input :lock:
- Launch "the Bombe" which will start all the web workers to find the original message :fire:
- Compute the number of combinations that have been tried so far :1234:
- Compute the elapsed time (until we've got a result) :hourglass_flowing_sand:
- Show the decrypted text (if any) :unlock:

Time to work on the code! Let's give it a go with a reactive version:

_We will have a look at the whole code and then detail it piece by piece._

`apps/enigma/src/app/decrypt/decrypt.component.ts`:

```ts
@Component({
  selector: 'app-decrypt',
  templateUrl: './decrypt.component.html',
  styleUrls: ['./decrypt.component.scss'],
  providers: [...DEFAULT_ENIGMA_MACHINE_PROVIDERS, EnigmaBombeService],
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
          // the decrypted text as it's outdated
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
    return fromWorkerPool<ConfigurationToDecrypt, string>(
      () =>
        new Worker('./enigma-bombe.worker', {
          name: 'enigma-worker',
          type: 'module',
        }),
      this.enigmaBombeService.getPossibleCombinationsWithEncryptedMessage(encryptedMessage),
    );
  }
}
```

A lot is going down here! Let's look at it piece by piece:

```ts
changeDetection: ChangeDetectionStrategy.OnPush,
```

:point_up: As we're going to work in a reactive way and only display values in the view using the `async` pipe, it's safe to use `ChangeDetectionStrategy.OnPush` for better performances.

```ts
public encryptedTextControl: FormControl = new FormControl('', containsOnlyAlphabetLetters({ acceptSpace: true }));
```

:point_up: We create a `FormControl` and make sure it can only have characters that can be processed by Enigma (using a custom validator).

```ts
public encryptedText$: Observable<string> = combineLatest([
  this.encryptedTextControl.valueChanges,
  this.encryptedTextControl.statusChanges,
]).pipe(
  map(([message, status]: [string, Status]) =>
    status !== Status.VALID
      ? // if the message is not valid we want to clear
        // the decrypted text as it's outdated
        ''
      : message.trim(),
  ),
  shareReplay({ bufferSize: 1, refCount: true }),
);
```

:point_up: We create an `Observable` combining the previous `FormControl` value and status. If the status is invalid, the encrypted text should be considered empty. This will reset the right input instead of being blocked on an old value if the text to decrypt is invalid.

Note the use of `shareReplay` here. We will be subscribing multiple times to that `Observable` but we want to share the source. As soon as everyone has unsubscribed from this stream , we want to close it (`refCount: true`). You can learn more about `shareReplay` and its parameters here: https://blog.angularindepth.com/rxjs-whats-changed-with-sharereplay-65c098843e95

```ts
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
```

:point_up: We now create an observable representing the decrypted bundle (`message` if any + `index` so that we can later compute the number of possibilities that have been tried). It's driven by `encryptedText$`. Every time `encryptedText$` changes, if the message is not empty then we try to launch the Bombe on that message. This gives us back a stream of potentially decrypted messages. We use `takeWhile` to keep that stream alive while the message has not been found. As soon as the message is found, you'll be able to notice that all the web workers will be shut down.

You may wonder why I did a condition in the `switchMap` based on the message instead of using a `filter` before the `switchMap`. If we did use a `filter` before, the workflow would be:

- Enter an encrypted message
- Try to decrypt the message
- Remove the encrypted message, thinking it'll stop the decrypt process
- It won't, _the Bombe_ will just continue as we'd be filtering out before the `switchMap` and therefore not killing the inner stream

While here, with the following condition:

```ts
!msg ? of(null) : this.decryptMessage(msg); // ...
```

If we're decrypting a message and the `encryptedText$` observable emits an empty value, we'd return `of(null)` which is a different stream than the one `switchMap` did subscribe to earlier. Therefore, it'll close the previous one.

```ts
public combinationsTried$: Observable<number> = this.encryptedText$.pipe(
  switchMap(() =>
    this.decryptedBundle$.pipe(
      skip(1),
      map(decryptedBundle => (!decryptedBundle ? 1 : decryptedBundle.index + 1)),
      startWith(0),
    ),
  ),
);
```

:point_up: In order to display the number of combinations tried, we'll create a stream based on the `decryptedBundle$` which has an `index`. The only thing to notice really is the fact that we use a `skip(1)` because the `decryptedBundle$` returns the last value that's been emitted (which could be the one when it found a previous message!). So instead of that, we skip it and use `startWith(0)`.

```ts
public elapsedTime$: Observable<number> = this.encryptedText$.pipe(
  timestamp(),
  switchMap(({ timestamp: initialTimestamp }) =>
    this.decryptedBundle$.pipe(
      timestamp(),
      map(({ timestamp: currentTimestamp }) => currentTimestamp - initialTimestamp),
    ),
  ),
);
```

:point_up: To find the elapsed time, every time the `encryptedText$` changes we also get a timestamp using the `timestamp` operator. This will represent the initial time. Then, every time the decrypted bundle emits, we get another timestamp and compare the two. The difference between them represents the elapsed time.

```ts
public decryptedText$ = merge(
  // whenever the encrypted text changes, reset the decrypted text
  this.encryptedText$.pipe(mapTo('')),
  // but as soon as we receive the decrypted text, return it
  this.decryptedBundle$.pipe(
    filter(decryptedBundle => !!decryptedBundle && !!decryptedBundle.message),
    map(decryptedBundle => !!decryptedBundle && decryptedBundle.message),
  ),
);
```

:point_up: Final piece of code: The decrypted text itself. If the encrypted text changes, we reset it. As soon as the decrypted bundle gives back a message, we return it.

# Conclusion

We've seen how to build _the Bombe_ using **TypeScript** and **Angular** by taking advantage of a **generator** to avoid a high memory consumption and **web workers** to work on multiple possibilities in parallel. Thanks to the [observable-webworker](https://github.com/cloudnc/observable-webworker) library, we're also able to manage our web workers result as a stream and automatically scale the number of workers used based on the device capabilities.

I hope this series was inspiring for you and that you may have learnt a few things along the way either on Enigma's mechanisms or on the tech side with web workers, generators, etc. Let me know in the comments! :smile:

Last but not least, don't forget to checkout the live demo here:  
https://maxime1992.github.io/my-dev.to/enigma

Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| Dev.to                                                                                                                              | Github                                                                                                                                           | Twitter                                                                                                                                              | Reddit                                                                                                                                                    | Linkedin                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) |
