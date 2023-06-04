---
published: true
title: "RxJS: Avoid an easy mistake when using startWith"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/rxjs-avoid-an-easy-mistake-when-using-start-with/assets/cover.jpg"
description: ""
tags: rxjs, angular, javascript
series:
canonical_url:
---

_As an example in this blog post, I'll use a really basic example with Angular to illustrate a real world example, but we'll focus on RxJS code, not Angular._

`startWith` can be a really useful operator to make sure an observable emits a value straight away when it gets subscribed to. A good example is when we want to display a form value.

In Angular, we have access to a form value through an observable like this: `formControl.valueChanges`. Except that this observable **only emits when the form value changes**. So if we subscribe to it, we won't get notified about the initial value.

In order to have the current form value from the start, we can then do the following:

```typescript
export class AppComponent {
  public form = new FormControl(null);

  public formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));
}
```

We can see that so far, it works as expected and the initial `null` value is the one displayed from the start.

{% embed https://stackblitz.com/edit/stackblitz-starters-dqbjkq?embed=1&file=src%2Fapp%2Fapp.component.ts %}

That said, this can lead to sneaky issues.

In the example above, try to change the form value to anything you like. You'll then see that the binding will display the new value live. Then, use the toggle button to hide the value and show it again. It'll display `null` instead of the real/current form value.

It can be a bit misleading at first why this happens. The reason is because of the `startWith`. Despite the observable being cold by nature, the `startWith` function is ran as soon as the class is instantiated. it's just a function, that isn't part of any callback. Initially, the form value is `null` as we've set it like that. So the first time we subscribe to the observable, it's fine.
Then we unsubscribe from it, in that case with the toggle + the `ngIf` removing the entire node and the `async` pipe unsubscribing for us. When we toggle the value again and the `ngIf` becomes `true`, we subscribe to the observable again, which as we mentioned had the `startWith` function ran as soon as the class was created, so it's permanently set to be the initial form value: `null`.

To go around this, here's what we can do instead:

```typescript
public formValue$ = concat(
  defer(() => of(this.form.value)),
  this.form.valueChanges
);
```

Using `concat`, we say that we'll start our stream with one inner stream, and once it's complete, continue from another one.
The first one is the key here. Using `defer`, it'll run the defer callback whenever it gets subscribed to, instead of as soon as the class is instantiated with `startWith`.
It means that whenever we subscribe again to the observable, we'll get the form value **at this time**, not at the time at which the class was instantiated.

Here's the final code and a live demo:

{% embed https://stackblitz.com/edit/stackblitz-starters-w5kpjs?embed=1&file=src%2Fapp%2Fapp.component.ts %}

Do note that this particular case was to have a somewhat realistic example, even though to display the current form value we'd just use `form.value` and be done with it, without any observable or async pipe. This can be applied anywhere you're using a `startWith`, `from`, `of` to get a value at the time of **subscription**, not at the time at which the code is read. It can also be useful when a stream can be retried if there's an error.

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the follow button for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| Dev.to                                                                                                                              | Github                                                                                                                                           | Twitter                                                                                                                                              | Reddit                                                                                                                                                    | Linkedin                                                                                                                                                              | Stackoverflow                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) | [![Stackoverflow](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/stackoverflow-logo.png 'Stackoverflow')](https://stackoverflow.com/users/2398593/maxime1992) |
