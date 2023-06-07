## My dev.to

# maxime1992's blog source

Hello there! Please find all my blog posts published here: https://dev.to/maxime1992

As you probably guessed by now, I'm using GIT and Github as my source of truth for my articles and then whenever I push, a pipeline is ran on CI to publish/update my articles directly on dev.to. This means that people can raise pull requests directly here to fix typos, update articles or contribute somehow and as soon as I approve and merge, it'll update all the affected articles.

If you wish to know more about this setup, I've made a [dedicated blog post](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j) for it. Additionally, here's how it works as a summary:

- I've created a small CLI utility to publish to dev.to. It's open source and hosted here: https://github.com/maxime1992/dev-to-git. You can publish/update your dev.to articles directly from the console, either locally or on CI. It's as simple as providing a dev.to token
- For convenience, I've also created a basic structure that is easy to reuse. I've open sourced that one as well on Github as a template that you can easily copy instead of forking this repo, removing all my articles etc... If you want to publish your articles on dev.to with the same mechanism I've explained so far, definitely use this template as it contains the Github actions already made for you. It's available here: https://github.com/maxime1992/dev.to

Any issues not related to one of my blog posts should be reported either to the [CLI repo](https://github.com/maxime1992/dev-to-git) or to the [template repo](https://github.com/maxime1992/dev.to).

## Blog posts

- [Building scalable robusts and type safe forms with Angular](https://dev.to/maxime1992/building-scalable-robust-and-type-safe-forms-with-angular-3nf9)

- [Manage your dev.to blog posts from a GIT repo and use continuous deployment to auto publish/update them](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j)

- [Angular: Easily extract a falsy value from an observable using the async pipe ?](https://dev.to/maxime1992/angular-easily-extract-a-falsy-value-from-an-observable-using-the-async-pipe-112g)

* Enigma: Understand it, implement it, crack it
  - [Part I: Enigma machine, how does the famous encryption device work?](https://dev.to/maxime1992/enigma-machine-how-does-the-famous-encryption-device-work-5aon)
  - [Part II: Building an Enigma machine with only TypeScript and then use Angular DI system to properly instantiate it](https://dev.to/maxime1992/building-an-enigma-machine-with-only-typescript-and-then-use-angular-di-system-to-properly-instantiate-it-2e2h)
  - [Part III: Brute-forcing an encrypted message from Enigma using the web worker API](https://dev.to/maxime1992/brute-forcing-an-encrypted-message-from-enigma-using-the-web-worker-api-166b)

- [Building a reactive microwave for Ryan Cavanaugh with RxJs](https://dev.to/maxime1992/building-a-reactive-microwave-for-ryan-cavanaugh-with-rxjs-3b1a)

- [Implement a generic oneOf type with Typescript](https://dev.to/maxime1992/implement-a-generic-oneof-type-with-typescript-22em)

- [Stackoverflow: Increase the chances to get answers to your questions](https://dev.to/maxime1992/stackoverflow-increase-the-chances-to-get-answers-to-your-questions-5gn9)

- [RxJS: Avoid an easy mistake when using startWith](https://dev.to/maxime1992/rxjs-avoid-an-easy-mistake-when-using-startwith-4ano)

- [How to detect unnecessary renderings of DOM elements in your web app to improve performance](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd)

* Next level data privacy
  - [Part I: Next level data privacy with easy, free and secure self hosting at home](https://dev.to/maxime1992/next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home-2c84)
  - [Part II: Paperless-ngx, manage your documents like never before](https://dev.to/maxime1992/paperless-ngx-manage-your-documents-like-never-before-2a3n)

- [The holy grail of note-taking: Private data, efficient methodology and P2P encrypted sync across all your devices](https://dev.to/maxime1992/the-holy-grail-of-note-taking-private-data-efficient-methodology-and-p2p-encrypted-sync-across-all-your-devices-1ih3)
