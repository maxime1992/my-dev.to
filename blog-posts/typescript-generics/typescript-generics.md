---
published: false
title: "I had no idea Typescript generics were capable of doing that 🤯!"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/typescript-generics/assets/cover.png"
description: ""
tags: typescript, types, generics
series:
canonical_url:
---


# Introduction

I'll walk you through a minimal reproduction of what I discovered.

It may just be me, but I find this trick mind blowing and if it wasn't a Friday out of desperation after trying a lot of other approaches... I would probably never have tried that. But it just worked and now I need to share this. Without further ado, let's jump into it.


# The challenge

An API which we don't own can return an object containing the same property, with a suffix going from 1 to 3. Example:

```ts
interface Order {
  price1: number;
  price2: number;
  price3: number;

  quantity1: number;
  quantity2: number;
  quantity3: number;

  shippingDate1: string;
  shippingDate2: string;
  shippingDate3: string;
}
```

Why is that API not exposing `prices`, `quantities` and `shippingDates` as array is beyond the point here.  
Let's just assume we consume an API that we cannot modify.

While the backend may expose this for a good reason, in our case, on the frontend side... We don't care about it and we'd rather prefer to have an interface looking like this:


```ts
interface Order {
  prices: number[];

  quantities: number[];

  shippingDates: string[];
}
```

While we know what the backend returns, we may end up having way more of those properties so we don't want to do the remap by hand and we'd like to build a function which takes as inputs the object and a common key and which returns an array of values, effectively grouping the different values.

Example:

```ts
const order: Order = await fetchOrder(); // we don't care about that part here, we're only interested in the remap function
getGroupedValues(order,'price') // returns an array of numbers
getGroupedValues(order,'quantity') // returns an array of numbers
getGroupedValues(order,'shippingDate') // returns an array of string
```

Main goal being: Have that function as type safe as possible for both inputs and the output as well.

# Implementation

We know this API will always return those properties, 3 times each (e.g. `price1`, `price2`, `price3`).

So we start here by using a recent feature of Typescript: [Template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).

```ts
type Indices = 1 | 2 | 3;

type GroupedKeys<T> = T extends `${infer U}${Indices}` ? U : never;
```

Pretty cool how easy it is to extract the base keys of all properties that appears 3 times right?

If we test it out, here's the output:

```ts
interface Order {
  price1: number;
  price2: number;
  price3: number;

  quantity1: number;
  quantity2: number;
  quantity3: number;

  shippingDate1: string;
  shippingDate2: string;
  shippingDate3: string;
}

type Indices = 1 | 2 | 3;

type GroupedKeys<T> = T extends `${infer U}${Indices}` ? U : never;

type Result = GroupedKeys<keyof Order>; // "price" | "quantity" | "shippingDate" 🎉
```

But don't worry, that's not where I was getting at. There's more.

Now let's build our generic `getGroupedValues` function (not the implementation as it's not the point) but rather its definition:

```ts
function getGroupedValues<Obj, BaseKey extends GroupedKeys<keyof Obj>>(object: Obj, baseKey: BaseKey): Array<Obj[`${BaseKey}${Indices}`]> {
  return null as any; // we're not implementing the function, just focusing on its definition
}
```

It feels like this could be exactly what we want!

- We accept any object type, therefore `Obj` above has no constraint
- The base key can be one of grouped keys of that `Obj`, therefore we write `BaseKey extends GroupedKeys<keyof Obj>`
- We type the inputs (nothing fancy here): `object: Obj, baseKey: BaseKey`
- As for the return type, we know that if we want to get an array of values for the prices (`price1`, `price2`, `price3`) then the `baseKey` passed as input will be `price`. Therefore if we access in the object the value of `${BaseKey}${Indices}`, we'll get `price1` | `price2` | `price3` which is exactly what we want

Fantastic! All done then! But wait... Typescript doesn't seem to be really happy here. On our return type, on

```ts
Obj[`${BaseKey}${Indices}`]
```

It says:

> Type '`${BaseKey}1` | `${BaseKey}2` | `${BaseKey}3`' cannot be used to index type 'Obj'

And it looks legit. We're trying to access properties on a generic which doesn't extends anything (our `Obj` type).  
But how can we keep this function generic and specify that our object will have keys that are composed of the base key and indices 🤔...

Would 

```ts
Obj extends Record<`${BaseKey}${BreakIndex}`, any>
```

Work? Surely it can't work, because `BaseKey` is defined after and it itself uses `Obj`:

```ts
Obj extends Record<`${BaseKey}${BreakIndex}`, any>, BaseKey extends GroupedKeys<keyof Obj>
```

Well this is just fine for Typescript.  
Read this again. It's fine to say that a given type will be an object (`Record`) which contains keys of another type (`BaseKey`), which itself is defined by reading the keys of `Obj`.

Me:

![Mind blown](./assets/mind-blown.png 'Mind blown')

I knew that Typescript could handle recursion just fine, like if you define a list which can have a list, which can have a list, ...

```ts
interface List {
  propA: number;
  list?: List
}

const list: List = {
  propA: 1,
  list: {
    propA: 2,
    list: {
      propA: 3
    }
  }
}
```

But this? I'm really glad that it actually does work but I'm surprised that Typescript doesn't complain here.

To wrap this up, here's the complete function (without the implementation but with all the types):


```ts
function getGroupedValues<Obj extends Record<`${BaseKey}${BreakIndex}`, any>, BaseKey extends GroupedKeys<keyof Obj>>(
  object: Obj,
  baseKey: BaseKey,
): Array<Obj[`${BaseKey}${BreakIndex}`]> {
  return null as any; // we're not implementing the function, just focusing on its definition
}
```

If we try it out we see the following:

```ts
// some mock for an order
const order: Order = {
  price1: 10,
  price2: 20,
  price3: 30,

  quantity1: 100,
  quantity2: 200,
  quantity3: 300,

  shippingDate1: '10 Oct',
  shippingDate2: '11 Oct',
  shippingDate3: '12 Oct',
}

const prices = getGroupedValues(order, 'price') // inferred return type: `number[]`
const quantities = getGroupedValues(order, 'quantity') // inferred return type: `number[]`
const shippingDates = getGroupedValues(order, 'shippingDate') // inferred return type: `string[]`
```

I've been working with TS on a daily basis for pretty much 5 years now.  
I just tried this on a Friday afternoon after being stuck for a while on the error

> Type '`${BaseKey}1` | `${BaseKey}2` | `${BaseKey}3`' cannot be used to index type 'Obj'

I was amazed to see that somehow Typescript is ok with those generics defined at the same level

```ts
Obj extends Record<`${BaseKey}${BreakIndex}`, any>, BaseKey extends GroupedKeys<keyof Obj>
```

Am I the only one? Did you know about this? Is anyone able to explain how Typescript can be ok with this? In any case leave a comment and tell me what you think about it and if this article was useful 😄!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
