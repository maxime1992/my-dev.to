---
published: true
title: "Build a reactive split-flap display with Angular"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/reactive-split-flap-display/build-a-reactive-split-flap-display-with-angular/assets/cover.png"
description: ""
tags: angular, rxjs, webdev, frontend
series: "Reactive split-flap display"
canonical_url:
---

Hello!

I've decided to make a follow up from [RxJS: Advanced challenge to build a reactive split-flap display](https://dev.to/maxime1992/rxjs-advanced-challenge-to-build-a-reactive-split-flap-display-1ej) and build UI for it as it's always more pleasant to play around with the final app than emit into a subject to see the text change.

Here's a **live demo** of what we'll be building, that you can play with 🔥:

{% embed https://stackblitz.com/edit/components-issue-sacg3e?embed=1&file=src%2Fapp%2Fapp.component.ts&view=preview %}

If you haven't read the previous article I mentioned above, you should really read it first before jumping on this one as the [reactive split-flap logic is already built](https://stackblitz.com/edit/rxjs-8vou8y?file=index.ts) and we'll only be focusing on the Angular side of things here.

# Porting the split-flap code to an Angular service

I'm going to be creating a new Stackblitz where I'll import most of the code we built in the first part and integrate that in a more Angular way.

I'll copy over the entire `utils.ts` file _(except for the part where I was manipulating the DOM manually)_.

Now, we'll create a new service `SplitFlapService` that'll reuse our reactive split-flap code and wrap up the creation of new instances:

```typescript
@Injectable({ providedIn: 'root' })
export class SplitFlapService {
  public getSplitFlapInstance() {
    const input$$ = new Subject<string>();

    const splitFlap$ = input$$.pipe(
      map(inputToBoardLetters),
      switchScan(
        (acc, lettersOnBoard) =>
          combineLatest(
            lettersOnBoard.map((letter, i) =>
              from(getLettersFromTo(acc[i], letter)).pipe(concatMap(letter => of(letter).pipe(delay(150)))),
            ),
          ),
        BASE,
      ),
    );

    return {
      input$$,
      splitFlap$,
    };
  }
}
```

So far, so good.

# Creating the view

First of all, we know we're going to have an input and that our split-flap only support a given number of chars. So we'll start by creating a custom validator for our `FormControl` that validates the input:

```typescript
function allowedLettersValidator(): ValidatorFn {
  return (control: FormControl<string>): ValidationErrors | null => {
    const allValidLetters = control.value
      .toUpperCase()
      .split('')
      .every(letter => REVERSE_LOOKUP_LETTERS[letter] !== undefined);

    if (allValidLetters) {
      return null;
    }

    return { invalidLetters: true };
  };
}
```

Nothing too fancy. We loop on each of the letters in the input and check if they are defined in our allowed chars. If not, we return an object `{ invalidLetters: true }` that'll make the input invalid.

Now, I won't define our `split-flap` component here. It's only a presentational component which takes an input for all the letters to display and display them. Nothing more so there's little interest in showing that. Feel free to look the code in the Stackblitz in the `src/app/split-flap` folder.

Finally, we can focus on the component that will use our new service, instanciate a `split-flap` and use it to show in the view based on an input, the associated `split-flap` display.

First of all, we inject our service and create an instance of a split-flap:

```typescript
public splitFlapInstance = inject(SplitFlapService).getSplitFlapInstance();
```

Then we create a form control for it, with our custom validator:

```typescript
public fc = new FormControl('', allowedLettersValidator());
```

Last but not least, we bind the value of our form control to the `input$$` of our split-flap _(without forgetting to unsubscribe when the component is destroyed)_:

```typescript
private subscription: Subscription | null = null;

constructor() {
  this.subscription = this.fc.valueChanges
    .pipe(
      filter(() => this.fc.valid),
      debounceTime(300)
    )
    .subscribe(this.splitFlapInstance.input$$);
}

public ngAfterDestroy() {
  this.subscription?.unsubscribe();
}
```

Our view can then have the input and the associated split-flap component:

```html
<mat-form-field>
  <mat-label>Input</mat-label>
  <input matInput [formControl]="fc" />
  <mat-error *ngIf="fc.invalid">Invalid chars used</mat-error>
</mat-form-field>

<app-split-flap [letters]="splitFlapInstance.splitFlap$ | async"></app-split-flap>
```

Here's the final project:

{% embed https://stackblitz.com/edit/components-issue-sacg3e?embed=1&file=src%2Fapp%2Fapp.component.ts %}

# Conclusion

I always like to start thinking about my streams in a really isolated way and once I've got everything working, then integrate where needed. It allows me to make sure I have a reusable code and keep my focus on the core logic, then the view.

Observables integrates of course really well with Angular thanks to a lot of the default API using and the wonderful `async` pipe.

---

I hope you enjoyed this article, if you did let me know with a reaction and eventually drop a comment. It's always nice to hear back from people who took the time to read a post 😄! If you gave a go to the challenge yourself, share a link to your Stackblitz or let us know how far you went too!

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| &nbsp;                                                                                                                              | &nbsp;                                                                                                                                           | &nbsp;                                                                                                                                               | &nbsp;                                                                                                                                                    | &nbsp;                                                                                                                                                                | &nbsp;                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) | [![Stackoverflow](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/stackoverflow-logo.png 'Stackoverflow')](https://stackoverflow.com/users/2398593/maxime1992) |

# You may also enjoy reading

| [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/building-scalable-robusts-and-type-safe-forms-with-angular/assets/sub-forms-schema.png)](https://dev.to/maxime1992/building-scalable-robust-and-type-safe-forms-with-angular-3nf9) | [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/detect-unnecessary-renderings-of-dom-elements/assets/cover.png)](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd) |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Building scalable robusts and type safe forms with Angular](https://dev.to/maxime1992/building-scalable-robust-and-type-safe-forms-with-angular-3nf9)                                                                                                                  | [How to detect unnecessary renderings of DOM elements in your web app to improve performance](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd)                                                         |
