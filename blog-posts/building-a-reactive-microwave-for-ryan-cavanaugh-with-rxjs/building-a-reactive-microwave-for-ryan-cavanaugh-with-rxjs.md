---
published: true
title: 'Building a reactive microwave for Ryan Cavanaugh with RxJs'
cover_image: 'https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/building-a-reactive-microwave-for-ryan-cavanaugh-with-rxjs/assets/microwave-cover.png'
description: 'Advanced example of reactive programming with RxJs'
tags: rxjs, typescript, javascript
series:
canonical_url:
---

Few weeks ago, I noticed while browsing Twitter that [Ryan Cavanaugh](https://twitter.com/SeaRyanC) had some issues with his microwave :
{% twitter 1245057506662952960 %}

Let's try to fix it for him, shall we? 😁

# Requirements

First, let's define the scope and requirements of our microwave.

As a user, I want my microwave to:

- Have 5 buttons so I can interact with it:
  - +10s: No matter what the current state is, add 10s to the remaining time
  - +60s: No matter what the current state is, add 60s to the remaining time
  - Start:
    - If the current state is "reset", simply start the microwave
    - If the current state is "stopped", resume the microwave
  - Stop: If the current state is "started", pause the microwave
  - Reset: If the current state is "started" or "stopped", stop the microwave and reset the remaining time to 0
- See the remaining time displayed at all time
- See the remaining time going down every second when the microwave is started
- Automatically stop when it's started and reaches 0s remaining

# Pick your weapons

## Language

The idea for this app and blog post came from [Ryan Cavanaugh](https://twitter.com/SeaRyanC)'s [tweet](https://twitter.com/SeaRyanC/status/1245057506662952960).  
**Typescript** has to be our default 🙏.

## Libs

We'll use only **1** library: **RxJs**.

As you've noticed in the requirements, a microwave is **time based** and also look like a **state machine**. RxJs will come really handy to handle such a case 🚀.

# State VS streams?

Before we start sketching out our main data flow, I'd like to clarify the difference between the **state** of our app VS the **streams** we can use.

A common pitfall I see quite often with RxJs is when someone creates a lot of `Subject`s or `BehaviorSubject`s to **hold some state**. It's making things quite hard to follow and then we have to combine multiple streams to build our main state using for example `combineLatest`.

While this could work nicely for a few streams, the more streams you add, the hardest it'll be to maintain. A pattern like Redux can instead be used and makes things much simpler to reason about. We'll discover a diagram in the next part to visualize this.

# Implementing the main data flow

Before implementing all the "details", we'll think and sketch our main stream. Based on the requirements explained earlier, we know that the state of the microwave will change based on 4 different **actions**:

- Add some time (in our case either +10s or +60s)
- Start the microwave
- Stop the microwave
- Reset the microwave

![Main data flow and state](./assets/redux-flow.png 'Main data flow and state')

Let's now transform the above diagram into some code.

## Defining the actions

We are now aware that we need to create 4 **actions**.

Actions are simple objects with:

- A type _(unique string per action)_
- A payload _(optional and can be anything)_

In a very simplified way, we could write them as such:

```ts
export interface StartAction {
  type: 'Start';
}

export interface StopAction {
  type: 'Stop';
}

export interface ResetAction {
  type: 'Reset';
}

export interface AddTimeAction {
  type: 'AddTimeMs';
  payload: { timeMs: number };
}
```

But thanks to Typescript, we can improve that code by building on top of it to make it type safe to:

- Create an action before dispatching it
- Make sure that in our "reducer" function we do not forget to deal with all of them
- Avoid to deal with strings and rather use enums

```ts
// as the number of actions has a known length
// I prefer to use an enum to define all of them
// rather than just writing the type of an action
// as a string
export enum EMicrowaveAction {
  START = 'Start',
  STOP = 'Stop',
  RESET = 'Reset',
  ADD_TIME_MS = 'AddTimeMs',
}

export interface StartAction {
  type: EMicrowaveAction.START;
}

export interface StopAction {
  type: EMicrowaveAction.STOP;
}

export interface ResetAction {
  type: EMicrowaveAction.RESET;
}

export interface AddTimeAction {
  type: EMicrowaveAction.ADD_TIME_MS;
  payload: { timeMs: number };
}

// we can also create a union type
// (or a "one of" type) of all our actions
// this will be useful in our reducer later on
export type MicrowaveAction = StartAction | StopAction | ResetAction | AddTimeAction;

// we don't **have to** use the namespace here
// but I personally like this approach as when
// you start having different parts in your
// store, you can use the namespace to clearly
// indicate which one is which, example from
// the previous schema:
// `UserActions`, `MessagesActions`, `DocumentsActions`, etc
export namespace Actions {
  // we then create a function for each action type
  // this allows us to simply call a well named function
  // instead of dispatching an object several times in our app
  export const start = (): StartAction => ({
    type: EMicrowaveAction.START,
  });

  export const stop = (): StopAction => ({
    type: EMicrowaveAction.STOP,
  });

  export const reset = (): ResetAction => ({
    type: EMicrowaveAction.RESET,
  });

  export const addTime = (timeMs: number): AddTimeAction => ({
    type: EMicrowaveAction.ADD_TIME_MS,
    payload: { timeMs },
  });
}
```

Good! We're now able to send actions 👏.  
Let's move on to the part where we need to handle them.

## Defining our reducer

Before we define our reducer... What the fork is a reducer?!

Let's take a quick look to our previous diagram:

![Reducer function](./assets/reducer.png 'Reducer function')

In the picture above, the **reducer** is the black square holding the microwave state. As you can notice, every time an action is being dispatched, the reducer will be called.

It is a simple function which:

- Takes 2 parameters
  - The current state
  - The action which just got dispatched
- Returns a new state

**Important note:**

A reducer **must be pure**:

- **Data must be immutable**  
  Never mutate data from the current state or the action
- **It must not have any side effect**  
  You can't for example make HTTP calls within a reducer. Make them before dispatching an action, and once you've got the result pass it in the payload of the action
- **For any input passed to the function we must be able to guess the output**  
  You can't for example get the current timestamp in a reducer. Instead, if you need the current timestamp get it before dispatching the action and pass it in the payload of the action

## The microwave state

We said previously that our microwave will have 4 actions available to change its current state (add time/start/stop/reset). But can the microwave status be the same as all these actions? Is it a 1-1 relationship? No, it isn't. The add time action shouldn't change the current **status** of the microwave.

Lets define the `MicrowaveStatus` for that purpose then:

```ts
export enum MicrowaveStatus {
  STARTED = 'Started',
  STOPPED = 'Stopped',
  RESET = 'Reset',
}
```

Now, we need to think about how to hold the internal state of the microwave. What data does our microwave need to work internally?

Of course, it'll need the status we just created so we can start with:

```ts
// internal state to the reducer
interface MicrowaveInternalState {
  status: MicrowaveStatus;
  // ... todo
}
```

It'll also need to keep track of how much time the user plans to use it (when adding time through the add time action):

```ts
interface MicrowaveInternalState {
  status: MicrowaveStatus;
  timePlannedMs: number;
  // ... todo
}
```

And finally, we need to keep track of how much time has been spent already with the microwave in the `STARTED` status.

```ts
interface MicrowaveInternalState {
  status: MicrowaveStatus;
  timePlannedMs: number;
  onAndOffTimes: number[];
}
```

You may now think:

> Why is `onAndOffTimes` an array of numbers instead of just the time elapsed in the `STARTED` status?

Lets think a bit about how a microwave works:

- You enter some time using the buttons
- You press start
- The microwave is running
- You can pause/restart the program until you reach 0s left (or stop it before)

At no point in that workflow you press a button to keep the microwave running every second. Well, this is exactly the same for our actions.

**Actions represent how we want to interact with the state and every computation should be driven from the state downstream**.

In this case, we keep a record of the timestamps when the user toggle the microwave on and off. Later on, we'll see how to compute the elapsed time. In the meantime, we can still prepare the interface that will be consumed publicly when we subscribe to the microwave stream. It is pretty much the same except that instead of `onAndOffTimes: number[]` we'll have `timeDoneMs: number`.

```ts
// exposed/computed state
export interface MicrowaveState {
  status: MicrowaveStatus;
  timePlannedMs: number;
  timeDoneMs: number;
}
```

Here's another diagram to visually represent what we're building:

![Reducer and selector](./assets/reducer-and-selector.png 'Reducer and selector')

## Implementing the reducer function

Now that we've understood the architecture we're trying to build and especially the role of the reducer function, we can start implementing it.

If you refer to the previous diagram, the reducer is a (**pure**) function which takes 2 parameters: The `MicrowaveInternalState` and an `action`. We'll see later on how to attach the current timestamp to each action (without having to pass it manually all the time). For now, we'll assume the current timestamp is passed within an object, next to the current action.

```ts
const microwaveReducer = (microwave: MicrowaveInternalState, { value: action, timestamp }): MicrowaveInternalState => {
  switch (action.type) {
    case EMicrowaveAction.START:
      return {
        // todo: return the new `MicrowaveInternalState`
      };

    case EMicrowaveAction.STOP:
      return {
        // todo: return the new `MicrowaveInternalState`
      };

    case EMicrowaveAction.RESET:
      return {
        // todo: return the new `MicrowaveInternalState`
      };

    case EMicrowaveAction.ADD_TIME_MS: {
      return {
        // todo: return the new `MicrowaveInternalState`
      };
    }

    default:
      unreachableCaseWrap(action);
  }

  return microwave;
};
```

Before we start implementing each case, note the use of a `switch` statement and the call in the `default` of `unreachableCaseWrap`.

As the `action.type` is a union type, every time we handle one case and return a result (hence stopping the `switch`), Typescript is smart enough to narrow down the next possible type. By having an `unreachableCaseWrap` function to which we pass the `action.type`, we can ensure that we don't forget to implement any type in our switch 🔥! Otherwise Typescript would throw an error at **compile time**.

```ts
export const unreachableCaseWrap = (value: never) => {};
```

By saying that `unreachableCaseWrap` takes as an input a value of type `never`, if within our `switch` statement we're not handling all the different possible types, Typescript will notice that we're trying to pass a value which is not of type `never`.

Cool! Now let's move on to implementing our reducer. Remember, we have to return a **new** state, without mutating the previous one. We want this function to remain **pure**.

> Does this mean we've got to deep copy the whole state? Isn't that going to be really expensive?

Nop 😁! And thanks to ES6 we can easily do this using the spread operator. Here's a tiny example:

```ts
const obj1 = {
  propA: {
    propA1: 'Value A 1',
    propA2: 'Value A 2',
  },
  propB: {
    propB1: 'Value B 1',
    propB2: 'Value B 2',
  },
};

console.log(obj1);
// displays:
// ---------
// {
//   propA: {
//     propA1: 'Value A 1',
//     propA2: 'Value A 2',
//   },
//   propB: {
//     propB1: 'Value B 1',
//     propB2: 'Value B 2',
//   }
// }

const obj1Updated = {
  ...obj1,
  propB: {
    ...obj1.propB,
    propB2: 'NEW VALUE',
  },
};

// `obj1` has **not** been modified
console.log(obj1);
// displays:
// ---------
// {
//   propA: {
//     propA1: 'Value A 1',
//     propA2: 'Value A 2',
//   },
//   propB: {
//     propB1: 'Value B 1',
//     propB2: 'Value B 2',
//   }
// }

console.log(obj1Updated);
// displays:
// ---------
// {
//   propA: {
//     propA1: 'Value A 1',
//     propA2: 'Value A 2',
//   },
//   propB: {
//     propB1: 'Value B 1',
//     propB2: 'NEW VALUE',
//   }
// }
```

And we can use the same syntax for arrays. Instead of using methods which mutates the array, like `push` for example, we can do the following:

```ts
const arr = [1, 2, 3];

console.log(arr);
// [1, 2, 3]

const arrUpdated = [...arr, 4];

// `arr` has **not** been modified
console.log(arr);
// [1, 2, 3]

console.log(arrUpdated);
// [1, 2, 3, 4]
```

As we're not deeply copying our entire state, this kind of copy is as efficient as possible. We reuse all the objects that we're not modifying and instead of making a deep copy, we just pass their reference.

Now that we know how to create an updated version of an object without mutating it, lets take a look to the full reducer:

```ts
const microwaveReducer = (microwave: MicrowaveInternalState, { value: action, timestamp }): MicrowaveInternalState => {
  switch (action.type) {
    case EMicrowaveAction.START:
      return {
        ...microwave,
        status: MicrowaveStatus.STARTED,
        onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
      };

    case EMicrowaveAction.STOP:
      return {
        ...microwave,
        status: MicrowaveStatus.STOPPED,
        onAndOffTimes:
          microwave.status !== MicrowaveStatus.STARTED
            ? microwave.onAndOffTimes
            : [...microwave.onAndOffTimes, timestamp],
      };

    case EMicrowaveAction.RESET:
      return INITIAL_MICROWAVE_STATE;

    case EMicrowaveAction.ADD_TIME_MS: {
      return {
        ...microwave,
        timePlannedMs: microwave.timePlannedMs + action.payload.timeMs,
      };
    }

    default:
      unreachableCaseWrap(action);
  }

  return microwave;
};
```

Once again, our function is **pure** 🙌. Easy to understand, not a single side effect, for any input we're able to expect a given output and easily testable. Fantastic!

## Implementing the selector function

As a reminder, here's how the selector should look like:

![Selector](./assets/selector.png 'Selector')

Just like a reducer, a selector must be a **pure function**.

```ts
const microwaveSelector = (microwave: MicrowaveInternalState): MicrowaveState => {
  switch (microwave.status) {
    case MicrowaveStatus.RESET:
      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.RESET,
        timeDoneMs: 0,
      };

    case MicrowaveStatus.STOPPED: {
      const timeDoneMs = computeTimeDoneMs(microwave.onAndOffTimes);

      if (microwave.timePlannedMs === 0 || microwave.timePlannedMs - timeDoneMs <= 0) {
        return {
          timePlannedMs: 0,
          status: MicrowaveStatus.RESET,
          timeDoneMs: 0,
        };
      }

      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.STOPPED,
        timeDoneMs: timeDoneMs,
      };
    }

    case MicrowaveStatus.STARTED:
      return {
        timePlannedMs: microwave.timePlannedMs,
        status: MicrowaveStatus.STARTED,
        timeDoneMs: computeTimeDoneMs(microwave.onAndOffTimes),
      };

    default:
      throw new UnreachableCase(microwave.status);
  }
};
```

We don't really care about the `computeTimeDoneMs`. It gives us how much time did the microwave spent running from the `onAndOffTimes` array. As it's not what we want to focus on today, here's the code without further explanations:

```ts
export const chunk = <T>(arr: T[]): T[][] =>
  arr.reduce<T[][]>((result, _, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []);

const computeTimeDoneMs = (onAndOffTimes: number[]) =>
  chunk(onAndOffTimes).reduce((timeElapsed, [on, off]) => timeElapsed + off - on, 0);
```

## Create the microwave state stream

### Build the MicrowaveInternalState stream

We now have all the logic for our state and our selector. We can start working on our data flow using RxJs streams. For that, we'll start by creating a **factory function** which for a given `action$` observable, will return a `MicrowaveState` observable.

As a first step, we'll create the function and manage the `MicrowaveInternalState` using our reducer:

```ts
const INITIAL_MICROWAVE_STATE: MicrowaveInternalState = {
  timePlannedMs: 0,
  onAndOffTimes: [],
  status: MicrowaveStatus.RESET,
};

export const createMicrowave = (action$: Observable<MicrowaveAction>): MicrowaveState => {
  const microwaveState$: Observable<MicrowaveInternalState> = action$.pipe(
    timestamp(),
    scan(microwaveReducer, INITIAL_MICROWAVE_STATE),
    startWith(INITIAL_MICROWAVE_STATE),
  );

  // todo: use our selector to transform the `MicrowaveInternalState` into a `MicrowaveState`
  // ...
};
```

**In less than 5 lines, we've got a fully reactive approach to manage our internal state so far 🤯.**

This is one of the reasons why RxJs is powerful and worth learning. But as nice as this is, it's probably a lot to process already! Lets go through it together:

- We get an `action$` stream. Any time a new action is dispatched, we'll receive it here
- The [`timestamp` operator](https://rxjs.dev/api/operators/timestamp) wraps a value into an object containing the value + the current timestamp
- The [`scan` operator](https://rxjs.dev/api/operators/scan) is similar to the `reduce` function available on iterable objects in Javascript. You provide a function (our `microwaveReducer` in this case), which will get an accumulator (our `MicrowaveInternalState`) and a value (our `action`). From this, it should return a value which will be emitted downstream and which will also become the new value passed as the accumulator the next time the `scan` runs. Finally, as the 2nd argument of the `scan` operator, we provide an initial state (in our case, the `INITIAL_MICROWAVE_STATE`). The `scan` operator is **really powerful** and let us have the state **scoped to that function**. It's not created before and it is only possible to update it by sending a new value to the `scan`. No one has access to a variable holding our state and likely to be mutated
- Last but not least, when we subscribe to the microwave we expect to receive an initial state. Before you start your microwave, it still exists, doesn't it? So right after the `scan`, we emit the initial state of the microwave. Another possible way to achieve this would be to `startWith(Actions.reset())` **before** the `scan` and then the `scan` would be started with the `RESET` action. But why run the whole reducer function when we know the initial value it's about to return?

### Build the public MicrowaveState stream using our selector

So far we know the current state of the microwave, how much time is left, and we've got an array with the timestamps of when it was toggled STARTED/STOPPED.

How can we get an update every second to represent the state of the microwave while it's running (started)?

```ts
const microwave$: Observable<MicrowaveState> = microwaveState$.pipe(
  switchMap(microwave => {
    switch (microwave.status) {
      case MicrowaveStatus.RESET:
      case MicrowaveStatus.STOPPED:
        return of(microwaveSelector(microwave));

      case MicrowaveStatus.STARTED:
        return timer(0, 1000).pipe(
          timestamp(),
          map(({ timestamp }) =>
            microwaveSelector({
              ...microwave,
              onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
            }),
          ),
          takeWhile(x => x.timeDoneMs < x.timePlannedMs),
          endWith(MICROWAVE_RESET_STATE),
        );

      default:
        throw new UnreachableCase(microwave.status);
    }
  }),
);
```

For `MicrowaveStatus.RESET` and `MicrowaveStatus.STOPPED`, we just pass the `MicrowaveInternalState` to our selector which will transform it to a `MicrowaveState`.

For the `MicrowaveStatus.STARTED`, it's slightly different as we need to update the stream every second (for the countdown):

- `timer(0, 1000)`: Start the stream immediately and emit every seconds
- `timestamp`: Get the current timestamp (which will be updated every second thanks to `timer`)
- `map`: Use the `microwaveSelector` (just like `MicrowaveStatus.RESET` and `MicrowaveStatus.STOPPED`) but instead of passing the internal state directly, we create a new object (immutability for the win!). Within that new object, we add the current timestamp into the `onAndOffTimes` (which therefore will update the `timeDoneMs` in the output) 🙌. The important thing to understand here is that thanks to immutability we never modify the original `onAndOffTimes` so by adding the new timestamp in the array we don't accumulate them in the array. We take the initial one and add one. We take the initial one and add one. We take the initial one and add one. Etc...
- `takeWhile(x => x.timeDoneMs < x.timePlannedMs)`: As soon as the time done is equal or greater than the time planned, we stop that inner stream (no more update needed every second)
- `endWith(MICROWAVE_RESET_STATE)`: When the stream ends, we emit the reset state

Note that before that inner stream, we've got:

```ts
microwaveState$.pipe(
  switchMap(microwave => {
    // ...
  }),
);
```

So when `microwaveState$` emits new value, we'll kill all that inner stream and start a new one, which is exactly what we want.

### Final version of the microwave factory function

```ts
export const createMicrowave = (action$: Observable<MicrowaveAction>): Microwave => {
  const microwaveState$: ConnectableObservable<MicrowaveInternalState> = action$.pipe(
    timestamp(),
    scan(microwaveReducer, INITIAL_MICROWAVE_STATE),
    startWith(INITIAL_MICROWAVE_STATE),
    publishReplay(1),
  ) as ConnectableObservable<MicrowaveInternalState>;

  const microwave$: Observable<MicrowaveState> = microwaveState$.pipe(
    switchMap(microwave => {
      switch (microwave.status) {
        case MicrowaveStatus.RESET:
        case MicrowaveStatus.STOPPED:
          return of(microwaveSelector(microwave));

        case MicrowaveStatus.STARTED:
          return timer(0, 1000).pipe(
            timestamp(),
            map(({ timestamp }) =>
              microwaveSelector({
                ...microwave,
                onAndOffTimes: [...microwave.onAndOffTimes, timestamp],
              }),
            ),
            takeWhile(x => x.timeDoneMs < x.timePlannedMs),
            endWith(MICROWAVE_RESET_STATE),
          );

        default:
          throw new UnreachableCase(microwave.status);
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // we need to keep the state subscribed as if no one is listening
  // to it we should still be able to take actions into account
  // note: we don't unnecessarily subscribe to `microwave$` as this
  // does some computation derived from the state so if someone subscribes
  // later on, that stream would still be up to date!
  const microwaveStateSubscription = microwaveState$.connect();

  return {
    microwave$,
    cleanUp: () => {
      microwaveStateSubscription.unsubscribe();
    },
  };
};
```

Notice the subtle changes above?

- `publishReplay(1)`?
- `shareReplay({ bufferSize: 1, refCount: true })`?
- `microwaveState$.connect()`?
- `cleanUp`?

This is the last part 🥵. Hang tight!

We have 2 stream to represent:

- The internal state: `microwaveState$`
- The public state: `microwave$`

When someone calls the `createMicrowave` factory function, they'll get a stream representing the microwave. But what if they start dispatching actions without listening to the microwave first? Nothing would be taken into account which is unfortunate.

To fix this, we put `publishReplay(1)` at the end of `microwaveState$`. This operator is quite powerful and brings the following features:

- The "publish" side transforms the `Observable` into a `ConnectableObservable`. It means that we will have to **connect** manually to the observable. The connect method will basically subscribe to it. This is why we need to return an object containing a `cleanUp` which will `unsubscribe` to it when needed
- The "replay" side (which needs an argument, here `1`) means that if a value is emitted by that stream **before** someone subscribe to it downstream, it'll keep the value and send it straight away to a late subscriber

The last one to understand is `shareReplay({ bufferSize: 1, refCount: true })`. It's applied as the last operator of the `microwave$` stream. When someone calls the `createMicrowave` factory function and subscribe multiple times to the `microwave$` stream, the `microwaveState$` won't be re-triggered (as explained previously it's been shared), but for `microwave$` we'd have the whole selector and observable chain for the started state running 1 time **per subscriber**. When we create an instance of a microwave using the `createMicrowave`, we should be able to subscribe multiple times to it without triggering that logic multiple times. Therefore, we use `shareReplay`. We set the `bufferSize` property to `1` so that if someone subscribes later on, he'll get the last value straight away. We set the `refCount` property to `true` (which is very important), so that if the microwave is started but no one listen, the whole observable chain with `timer`, `timestamp`, `microwaveSelector`, `takeWhile`, `endWith` will **NOT** run. Only if there's at least one subscriber. And if more than one, they share the results 🔥.

# Conclusion

On one hand, working with observables and thinking reactively can be very challenging. There's a steep learning curve and the concept is very different from imperative programming.

On the other hand, RxJs is very powerful and once we get used to it, it becomes easier to write complicated workflows.

If you decide to use reactive programming, remember that using `subscribe` is where the reactive programming ends.

{% twitter 1180316203937681410 %}

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
