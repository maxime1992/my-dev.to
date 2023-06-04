---
published: true
title: "Angular: Easily extract a falsy value from an observable using the async pipe ?"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/angular-easily-extract-a-falsy-value-from-an-observable-using-the-async-pipe/assets/cover-horror-face.png"
description: ""
tags: angular
series:
canonical_url:
---

Whether you've been using Angular for years or if you just got started with it a day ago, chances are you probably know the `ngIf` directive. It lets you display (create or remove) a DOM element based on a condition.

As simple as it sounds, there's one (native) functionality of `ngIf` that not many people seems to be aware of.

# Table of content

- [Unwrap observables from the template](#unwrap-observables-from-the-template)
- [How to unwrap falsy values from an observable?](#how-to-unwrap-falsy-values-from-an-observable)
  - [Wrap the value into an object](#wrap-the-value-into-an-object)
  - [Use ngIf itself from the template!](#use-ng-if-itself-from-the-template)

# Unwrap observables from the template

As Angular plays really nicely with RxJs, you can take advantage of the `ngIf` directive when you have an observable by using the `async` pipe and the `as` syntax:

```html
<div *ngIf="user$ | async as user">
  {{ user.name }}
</div>
```

**But what happens when you want to extract a value from an observable using the `async` pipe if that value is falsy?**  
For example a boolean that's `false`, `0` (the number), an empty string, a `null` or `undefined` value, etc.

The value wouldn't be displayed as the `ngIf` condition will be evaluated as falsy.

There's a long standing issue here: https://github.com/angular/angular/issues/15280

# How to unwrap falsy values from an observable?

The main proposal in the issue above is to have an `ngLet` directive that'd have the same capabilities as `ngIf` but would always display the template even if the value is falsy.

Would that `ngLet` directive be the silver bullet for that situation and if so, how can we deal without it in the meantime?

## Wrap the value into an object

Wrap the value within the observable into an object using the `map` operator.

Example:

```ts
const wrappedValue$ = falsyValue$.pipe(map(value => ({ value })));
```

We could do slightly better by having a proper type and a custom rxjs operator. This would reduce the boilerplate, code duplication and improve the readability. Not bad!

But modifying our data stream because of a display issue, it feels like we can/should do better. And we can by using... only Angular!

## Use ngIf itself!

The Angular compiler let you do that wrapping directly from your template:

```html
<div *ngIf="{ falsyValue: falsyValue$ | async } as data">
  {{ data.falsyValue}}
</div>
```

It's apparently not a well known functionality but it's really useful for multiple reasons:

- In the above example, the `data` object is always defined so no matter what's in that object, the `ngIf` condition will always be evaluated as `true`. This can replace the `ngLet` directive

* We can push things further by subscribing to multiple properties at once, no need for nested `div` or `ng-container`!

Before:

```html
<ng-container *ngIf="wrappedValue1$ | async as wrappedValue1">
  <ng-container *ngIf="wrappedValue2$ | async as wrappedValue2">
    <ng-container *ngIf="wrappedValue3$ | async as wrappedValue3">
      {{ wrappedValue1 }} {{ wrappedValue2 }} {{ wrappedValue3 }}
    </ng-container>
  </ng-container>
</ng-container>
```

After:

```html
<div
  *ngIf="{
    value1: value1$ | async,
    value2: value2$ | async,
    value3: value3$ | async
  }"
>
  {{ value1 }} {{ value2 }} {{ value3 }}
</div>
```

Much cleaner isn't it?

# Conclusion

I think that having an `ngLet` directive might bring **clarity** about what we're trying to achieve and more importantly, it might be useful when we have **only one observable to manage** to be able to do the following instead of wrapping it into an object:

```html
<div *ngLet="value$ | async as value">
  {{ value }}
</div>
```

But for now, the workaround is trivial and shouldn't stop you to do that transformation template side instead of within your TS code.

Happy coding!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| Dev.to                                                                                                                              | Github                                                                                                                                           | Twitter                                                                                                                                              | Reddit                                                                                                                                                    | Linkedin                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) |
