---
published: true
title: "Implement a generic oneOf type with Typescript"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/implement-a-generic-one-of-type-with-typescript/assets/implement-a-generic-one-of-type-with-typescript-cover.png"
description: "Implement a generic oneOf type with Typescript"
tags: typescript
series:
canonical_url:
---

Have you ever came across a case in your Typescript codebase where you were trying to describe a `oneOf`?

I did multiple times and previously, I've had to choose between readability and type safety 😑.

Let say we want to express the fact that a player of our game can choose before an adventure an animal to come with him. Not all the animals that are available in the game though, he'd have to choose only 1 between:

- a dog 🐶
- a wolf 🐺
- an eagle 🦅
- a mouse 🐭

# Readability over type safety

If we care more about readability than type safety, we could simply describe an animal and a player as the following:

```ts
interface Animal {
  id: string;
  name: string;

  // the animal can be ONE of the following
  dog: Dog | null;
  wolf: Wolf | null;
  eagle: Eagle | null;
  mouse: Mouse | null;
}

interface Player {
  id: string;
  nickname: string;
  level: number;
  animal: Animal;
}
```

In this case, the interface would be pretty easy to read, but we could define a `dog` and a `wolf` for the player and Typescript would still be happy.

# Type safety over readability

We know that the player can only choose between 🐶, 🐺, 🦅 and 🐭. We can take advantage of that information and instead of having a comment `// the animal can be ONE of the following`, we can express that with Typescript (which will bring us some additional type safety later on!).

To keep things simple, let's start with only 2: 🐶, 🐺.

```ts
type Animal = {
  id: string;
  name: string;
} & (
  | {
      dog: Dog | null;
      wolf: null;
    }
  | {
      dog: null;
      wolf: Wolf | null;
    });

interface Player {
  // ... same ...
}
```

This way we do express the fact that **the animal can either be a dog OR a wolf but we can't have both at the same time**. While it may seem reasonable to have the type above, let see how it'd look with our 4 animals now:

```ts
type Animal = {
  id: string;
  name: string;
} & ({
  dog: Dog | null;
  wolf: null;
  eagle: null;
  mouse: null;
} | {
  dog:  null;
  wolf: Wolf | null;
  eagle: null;
  mouse: null;
} | {
  dog: Dog null;
  wolf: Wolf null;
  eagle: Eagle | null;
  mouse: null;
} | {
  dog: null;
  wolf: null;
  eagle: null;
  mouse: Mouse | null;
});

interface Player {
  // ... same ...
}
```

Uh 😵... Now can you imagine what it'd look like if we made an update to the game to add 5, 10 or 15 new animals? 🤕

This simply doesn't scale.

# Best of both worlds

How cool would it be to have something like the following:

```ts
type Animal = {
  id: string;
  name: string;
} & OneOf<{
  dog: Dog;
  wolf: Wolf;
  eagle: Eagle;
  mouse: Mouse;
}>;

interface Player {
  // ... same ...
}
```

Assuming that we had all the type safety as the example before, I think that'd be pretty nice!

But can we? Let's give it a go, step by step.

The first thing to do would be to have a generic type to which if we pass

```
{
  dog: Dog;
  wolf: Wolf;
  eagle: Eagle;
  mouse: Mouse;
}
```

and one key from the type above, let say `dog` we'd then get the following type:

```
{
  dog: Dog;
  wolf: Wolf | null;
  eagle: Eagle | null;
  mouse: Mouse | null;
}
```

We'll call this type `OneOnly`:

```ts
type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
```

![How to draw an owl](./assets/how-to-draw-an-owl.jpg 'How to draw an owl')

Let's try to breakdown and understand the type above:

```ts
type OneOnly<Obj, Key extends keyof Obj>
```

So far, it should be fine. We can pass a type that we call `Obj` and we then have to pass one key of that type as the second argument.

```ts
{ [key in Exclude<keyof Obj, Key>]: null }
```

Now, we loop over all the keys of the `Obj` type, **except** the one we passed as the second argument of the generic. For all of those keys, we say that the only value they can accept is `null`.

Last missing piece of the puzzle:

```ts
Pick<Obj, Key>
```

We extract from the `Obj` type the `Key`.

So in the end we've got

```ts
type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
```

Which if we use it with a `dog` for example would give us:

```ts
type OnlyDog = OneOnly<
  {
    dog: Dog;
    wolf: Wolf | null;
    eagle: Eagle | null;
    mouse: Mouse | null;
  },
  'dog'
>;
```

And the `OnlyDog` type would then be equivalent to:

```ts
{
  dog: Dog;
  wolf: Wolf | null;
  eagle: Eagle | null;
  mouse: Mouse | null;
}
```

Cool! I think we've got the most complicated part of our final `OneOf` type done ✅.

Now, you may have seen this coming... We've got to loop over our `Obj` type and generate all the `OneOnly` types for every key:

```ts
type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };
```

Nothing too fancy here, and yet, this line is pretty powerful! If we do:

```ts
type OnlyOneAnimal = OneOfByKey<{
  dog: Dog;
  wolf: Wolf;
  eagle: Eagle;
  mouse: Mouse;
}>;
```

It'll give us a type like the following:

```ts
{
  dog: OneOnly<Dog>;
  wolf: OneOnly<Wolf>;
  eagle: OneOnly<Eagle>;
  mouse: OneOnly<Mouse>;
}
```

That is suuuuuuper coooool right? But... 🤔

**We want a union type of all the values from the type above**.

Something like:

```ts
OneOnly<Dog> | OneOnly<Wolf> | OneOnly<Eagle> | OneOnly<Mouse>
```

How can we achieve that? Simply with the following:

```ts
type ValueOf<Obj> = Obj[keyof Obj];
```

This will create a union type of all the values from the `Obj` type.

So finally, our `OneOf` is now just:

```ts
type OneOfType<T> = ValueOf<OneOfByKey<T>>;
```

🤩 Nice, isn't it? 🤩

Here's the full code as summary:

```ts
type ValueOf<Obj> = Obj[keyof Obj];
type OneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
type OneOfByKey<Obj> = { [key in keyof Obj]: OneOnly<Obj, key> };
export type OneOfType<Obj> = ValueOf<OneOfByKey<Obj>>;
```

And how we can now use it:

```ts
type Animal = {
  id: string;
  name: string;
} & OneOf<{
  dog: Dog;
  wolf: Wolf;
  eagle: Eagle;
  mouse: Mouse;
}>;

interface Player {
  // ... same ...
}
```

The cool thing now is, when defining a player and its animal, we can only define **one of** the animals. Not 0, not 2, not 3, not 4. Only one 😁.

![Demo one of type safety](./assets/demo-one-of-type-safety.gif 'Demo one of type safety')

Here's a [Typescript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAaghgGwK4QPIDMA8qBGArAPigF4pc8BtAawhAHt0z8BdAbgFgAoUSMgOzR8EIbPgA0UANJQIAD2AQ+AEwDOUGvUbkipAN5RqtKAEs+UAKKyAxsiURMGhkzwTJBZgC4ofJAgRQAXygAMih9QxATM0lPZwoYwI5ucGhUAQwAIRBJWlFCEjCDDSj1WidyWLTBYTyJDSIApLkwOgAnYCgeVPSsABUdWEQUDGwerJyRfoIkrlMFVvQ4K2gAEToAczCuKB2Ael3OuiU6LgDZvnnF5agAdToERl1tvYPgI5POM845iAWl6HMcHWCGgT04Oyg+0Ox1O50u-ygAFk6EgVKDnpDXu9YZwuF0oABBPjGAC2iAKYIhxiUXhUwFapnWSQhfDgJIgtPpjKSQVCVRGlJ2x3WXjWTIxAHd7ugvHcHsydhAgSCvIDgRAFVASSi0V5kaiNadplw4b8rtAAAoIOAgX5bcE7amchl8cUO7zGKxUVns53cjEggBuEAQXh8JJwv01cGJZNDhNjiB5Js4VjofDpUDA1ttrS8Vptdr0GKdUAA5NnC60ALQABjLYgxxK9Po55bJslJEAAjABOXsAJgbAYgwfjtcb7pjpMQXkFEJMNPL07jdeH7pZbLbZYA4gALOh09cLoUbOcBScnmTKts+PyXk-ag1h3wIB8LqUPF-3jFfL6zRgAApK1zAA6FdEFA4UAEp7QhKEJT3RR1D4OgJU6Pc4A6AADYVsJMNQ7HQUwICUCQJWgFQ4HQENIkw4MoCWZYVDUN5GL8DDoGFMs1DAVo6EgdpjAgFQMShGMlCgCj2JUOgULQjCsKgbDP3QbCJGwpV1XwiTlKfNEdNaaA7wQDEQN+cDEwQUDVMxbxXzMnMLIg6ytJBOyTMcqtLJnaz9OgKFPM+LggA) which you can have fun with. It contains all the code we've seen and the final demo shown in the gif above.

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
