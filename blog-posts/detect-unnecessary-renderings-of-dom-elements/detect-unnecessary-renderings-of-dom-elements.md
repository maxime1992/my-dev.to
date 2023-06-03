---
published: false
title: "How to detect unnecessary renderings of DOM elements in your web app to improve performances 🔥"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/detect-unnecessary-renderings-of-dom-elements/assets/cover.png"
description: ""
tags: webdev, html, javascript, tutorial
series:
canonical_url:
---

_The code examples I'm giving is using Angular but it's only a very low amount of code to illustrate the main issue and that issue can happen in any Javascript application that interacts with the DOM._

# Intro

Unnecessary repaints in a web app can have a critical impact on performances.

While you may be developing it on a high end device, you may not even notice. But a user running it on a lower end device may definitely.

One question remains: **How to be aware of unnecessary repaints?**

# Illustrate the main issue

Before we dig into this, let me illustrate the original issue.

Here's a very basic app that simulates the fetching of a users array and display each of them, line by line, in a list.

{% embed https://stackblitz.com/edit/stackblitz-starters-udsxgy?embed=1&file=src%2Fapp%2Fapp.component.html %}

![Fetching users list, nothing too fancy](./assets/fetching-users-list-nothing-too-fancy.png 'Fetching users list, nothing too fancy')

What happens if you click on the "Fetch people" button several times? Apprently nothing. Our list is still the same, nothing is removed, added... And yet...

# Finding unnecessary repaints

When we click on the button to fetch people, in this example we emulate a network call'd return an array of people. It'd just happen to be the same result. But behind the scenes, we'd receive a brand new reference for the array... And all the objects in it! Therefore Angular assumes it has to repaint the whole list.

But how to detect this in our entire app? Do we have to be mentally aware of everything that could trigger our framework to repaint unnecessary bits of the app?

There's a very straightforward way to find out, you just have to be aware of a feature in the chrome devtool that is a little bit hidden: **Paint flashing**.

It can be found in: Dev tools > Hamburger menu > More tools > Rendering > Paint flashing.

Here's where to find it and a demo of what happens with this feature on:

![Fetching the users list triger a repaint for the whole list](./assets/paint-flashing-with-issue.gif 'Fetching the users list triger a repaint for the whole list')

Notice how whenever we fetch the users list, the whole list flashes green? It's the dev tools showing us which DOM elements have been repainted. And if we've got the same list, surely it shouldn't repaint!

# Fixing the issue

This will need some investigation and there's unfortunately no silver bullet I can give you here. In this particular case, we can tell Angular to track items by a unique ID to it's aware whether it can reuse an element or not. This blog post isn't about Angular so I won't dwell on the fix but if we use a `trackBy` on our `ngFor` like this `*ngFor="let person of people; trackBy: trackById"` and define the `trackById` function as

```ts
public trackById(_: number, person: Person) {
  return person.id;
}
```

Then Angular will be able to optimize the rendering.

![Fetching the users list does not triger a repaint for the whole list](./assets/paint-flashing-without-issue.gif 'Fetching the users list does not triger a repaint for the whole list')

Notice here that the first time we fetch the list, of course it has to be rendered once. So it flashes green. But whenever I try to fetch it again, only the button flashes (as I'm clicking onto it and it animates).

From there, we know we've optimized our app to avoid unnecessary renderings ✅.

# Conclusion

This method will help you find out items that are repainted while they shouldn't, in no time. Of course, the illustration I've made isn't problematic because it's a demo app, but in real life you render hundreds or thousands of DOM elements at an intense pace to reflect fast changes in the data, it could become problematic.

I hope you enjoyed this article. If you're interested in more tips about Angular, RxJS, open source, self hosting, data privacy, and others, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).
