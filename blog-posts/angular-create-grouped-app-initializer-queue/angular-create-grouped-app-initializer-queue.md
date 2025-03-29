---
published: true
title: "Fun with Angular: Create grouped queues of tasks for APP_INITIALIZER"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/angular-create-grouped-app-initializer-queue/assets/cover.jpg"
description: ""
tags: angular, rxjs, webdev, frontend
series:
canonical_url:
---

# Intro

Have you ever heard of [`APP_INITIALIZER`](https://angular.io/api/core/APP_INITIALIZER)? It's a handy DI token that lets you provide one or more initialization functions that'll be run before your entire app starts. They can come in very handy. But did you know that all the `APP_INITIALIZER` registered providers **will be created at the same time**?

Let's make that more flexible.

Because we desperately need it? Hell no.  
Because I realized that limitation today and wanted to have some fun? Definitely.

It's a really good example to practice with dependency injection and observables. What else do we need for fun?

!['What else'](./assets/angular-rxjs-what-else.jpg 'What else?')

# APP_INITIALIZER and its limitations

If you want to make sure to execute an initialization function **that is blocking** before your app starts, `APP_INITIALIZER` is exactly what you need. Example from the [documentation](https://angular.io/api/core/APP_INITIALIZER#usage-notes):

```typescript
function initializeApp(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Do some asynchronous stuff
    resolve();
  });
}

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => initializeApp,
      multi: true,
    },
  ],
})
export class AppModule {}
```

Pretty cool, right?

But what happens you now have multiple `APP_INITIALIZER` defined? It's got the `multi` argument set to `true` after all so we can provide as many as we want to:

```typescript
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: () => initializeApp,
    multi: true,
  },
  {
    provide: APP_INITIALIZER,
    useFactory: () => doSomethingElse,
    multi: true,
  },
  {
    provide: APP_INITIALIZER,
    useFactory: () => wowAnotherThing,
    multi: true,
  },
];
```

Well they all run in parallel. They'll be called in the order they were declared, but won't wait for each others to finish before executing the next one.

!['Started at the same time'](./assets/started-at-the-same-time.png 'Started at the same time')

What if we needed _(or rather wanted)_ that? Even better, what if we could define different queues were within a queue, they'd execute one after another but all the queues would be started in parallel:

!['Queues'](./assets/queues.png 'Queues')

# Talk is cheap. Show me the code

`APP_INITIALIZER` is an injection token. We want a similar capability. In order to achieve this, we'll do 2 things:

1. Create an injection token that will be define as `multi: true` and that we can pass multiple times to build the different tasks of our queues
2. Create an injection token that will be provided only once as an `APP_INITIALIZER` and will manage all of our queues. Once all the queues are resolved, only then we'll consider that our initilisation fase for this token is complete

Let's start with the first point.

## Defining the token for all of our queues

```typescript
export type AppInitializerQueueToken = string | symbol | number;

const DEFAULT_QUEUE = 'DEFAULT_QUEUE';

export interface AppInitializerQueueParam {
  queue?: AppInitializerQueueToken;
  task$: Observable<any>;
}

export const APP_INITIALIZER_QUEUE_TOKEN = new InjectionToken<AppInitializerQueueParam[]>(
  `APP_INITIALIZER_QUEUE_TOKEN`,
);
```

Our `APP_INITIALIZER_QUEUE_TOKEN` is to be provided **multiple times**. Hence the array in the type.

If we look at the `AppInitializerQueueParam`, we see that will be able to define a `queue` name _(could be a string but it could also be a number or a symbol to make sure a queue is really unique)_. It'll also be able to define a `task$` as an observable.

Now let's look at the second point which is the bulk of the work where we'll manage our different queues.

## Managing all the queues

We'll start by defining our provider's global shape:

```typescript
export const APP_INITIALIZER_QUEUE_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: (appInitializerQueueParams: Nilable<AppInitializerQueueParam[]>) => {
    if (!appInitializerQueueParams) {
      return;
    }

    // @todo

    return () => someObservableHere$;
  },
  deps: [[new Optional(), APP_INITIALIZER_QUEUE_TOKEN]],
};
```

Already quite a lot going on!

We `provide` as mentioned earlier, using the `APP_INITIALIZER` so that this initialisation function is blocking for the app.

We set `multi: true` because we're using `APP_INITIALIZER` here and that's how it works, it can be provided multiple times.

We then use a factory function to build our core logic and make sure to type it accordingly with our `appInitializerQueueParams`.

That params is marked as `Nilable` _(using [`tsdef`](https://www.npmjs.com/package/tsdef))_, because if we do not provide any `APP_INITIALIZER_QUEUE_TOKEN`, we'll then get null here. Which leads us to this code:

```typescript
deps: [[new Optional(), APP_INITIALIZER_QUEUE_TOKEN]],
```

When we provide the dependencies for our factory function, we say explicitely that providing `APP_INITIALIZER_QUEUE_TOKEN` is **optional**. The reason for this is because one could start by definining this queue provider, but not yet have built the queue tokens and we don't want the app to crash for this. Note the use of a tuple here as we cannot use the decorator `@Optional` as we would normally do when injecting an optional dependency from a class constructor.

Lastly, we do `return () => someObservableHere$` because the `APP_INITIALIZER` expects a function that returns an observable _(or it can a promise etc but we'll just focus on observables here)_.

### Create one provider per queue

Remember how we'll have multiple queues, each of them having multiple tasks, and all that provided through DI? Well you have to keep in mind that our code is read line after line:

| How tasks are actually provided                                                               | How we want our queues to be              |
| --------------------------------------------------------------------------------------------- | ----------------------------------------- |
| !['How tasks are provided')](./assets/tasks-provided-one-by-one.png 'How tasks are provided') | !['Queues'](./assets/queues.png 'Queues') |

This is just **one** example of the order in which they could be declared. Note that for a given color _(queue)_, all the tasks define the queue order by the order in which they are declared. But it doesn't mean that we have to provide them exactly one after another for the same queue. We could definitely declare tasks from other queues in between.

In order to achieve that transformation from a single array of tasks to a grouped pool of queues with ordered tasks, the first thing we need is to group our providers by queue:

```typescript
const tasksByQueue = appInitializerQueueParams.reduce((acc, x) => {
  const queueName = x.queue ?? DEFAULT_QUEUE;

  if (!acc[queueName]) {
    acc[queueName] = [];
  }

  acc[queueName].push(x.task$);

  return acc;
}, {} as Record<AppInitializerQueueToken, Array<Observable<any>>>);
```

Because we want to group by queue, we'll have a data structure that is a `Record` _(a dictionary, an object)_ that'll take as key a queue identifier _(string, symbol or number)_, and as a value an array of observables, representing all the tasks for the current queue.

### Instantiate the providers per queue sequentially

Thanks to RxJS, instantiating all the providers of a queue sequentially is a breathe

!['The feeling'](./assets/the-feeling.jpg 'The feeling')

```typescript
const tasksByQueue$ = Object.values(tasksByQueue).map((tasks: Array<Observable<any>) =>
  concat(...tasks),
);
```

### Start all the queues simultaneously

We now have `tasksByQueue$` which is `Array<Observable<any>>` and we want to get instead `Observable<any>` and make sure that we subscribe to all in paralell:

```typescript
merge(...tasksByQueue$);
```

That's it!

### Complete code

{% embed https://stackblitz.com/edit/stackblitz-starters-x4yc7t?embed=1&file=src%2Fapp-initialized-queue.ts&view=editor %}

### Usage

Here's an example of how we can then provide our tasks for different queues. Take a look at the console output:

{% embed https://stackblitz.com/edit/stackblitz-starters-x4yc7t?devToolsHeight=33&embed=1&file=src%2Fmain.ts %}

# Conclusion

Angular DI system is very powerful and so is RxJS. We've been able to implement a queue system to initialize our app with different tasks ran sequentially, but grouped by queues ran themselves in parallel. The core logic takes **~30 lines of code**.

Keep in mind that any initialization attached to `APP_INITIALIZER` must be carefully through as this will delay the start of your app. While I'm sure there are a few cases where this could come in handy, I mostly thought of that as a little challenge with Angular and RxJS.

---

I hope you enjoyed this article, if you did let me know with a reaction and eventually drop a comment. It's always nice to hear back from people who took the time to read a post 😄!

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| &nbsp;                                                                                                                              | &nbsp;                                                                                                                                           | &nbsp;                                                                                                                                               | &nbsp;                                                                                                                                                    | &nbsp;                                                                                                                                                                | &nbsp;                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) | [![Stackoverflow](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/stackoverflow-logo.png 'Stackoverflow')](https://stackoverflow.com/users/2398593/maxime1992) |

# You may also enjoy reading

| [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/reactive-split-flap-display/build-a-reactive-split-flap-display-with-angular/assets/cover.png)](https://dev.to/maxime1992/build-a-reactive-split-flap-display-with-angular-kne) | [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/detect-unnecessary-renderings-of-dom-elements/assets/cover.png)](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd) |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Build a reactive split-flap display with Angular](https://dev.to/maxime1992/build-a-reactive-split-flap-display-with-angular-kne)                                                                                                                                   | [How to detect unnecessary renderings of DOM elements in your web app to improve performance](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd)                                                         |
