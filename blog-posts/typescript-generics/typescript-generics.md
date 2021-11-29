---
published: false
title: "I had no idea Typescript generics were capable of doing that 🤯!"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/typescript-generics/assets/cover.png"
tags: typescript, types, generics
---

# Context

An API which we don't own can return an object containing the same property, with a suffix going from 1 to 3. Example:

```ts
interface Order {
  // some unique keys
  id: string;
  name: string;

  // some keys "grouped" by 3 
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

_Notes:_
- _Why is that API not exposing `prices`, `quantities` and `shippingDates` as arrays is beyond the point here. Let's just assume we consume an API that we cannot modify_
- _This is just an example and the returned type could have way more properties like that, so we don't want to have to make the whole remapping manually_

# The challenge

While the backend may expose it this way for a good reason, in our case, on the frontend side, we'd rather prefer to have a data structure matching our needs in a better way.

## Part 1

Build a `getGroupedValues` function which will have
- Input 1: An object
- Input 2: A key for one of the repeated properties. Example if we pass an `Order` as first argument, we could pass as second argument either `price`, `quantity` or `shippingDate`
- Output: An array of the type matching the union of all the keys for that common one. Example with `Order`, if the second argument is `price` we'd expect as an output `number[]` but if it's `shippingDate` we'd expect `string[]`

This could be a building block to do something like this:

```ts
interface OrderRemap {
  id: string;
  name: string;

  prices: number[];
  quantities: number[];
  shippingDates: string[];
}

declare const order: Order; // no need to know where it's coming from for the example

const orderRemap: OrderRemap = {
  id: order.id,
  name: order.name,

  prices: getGroupedValues(order, 'price'),
  quantities: getGroupedValues(order, 'quantity'),
  shippingDates: getGroupedValues(order, 'shippingDate'),
};
```

Main goal being: Have that function as type safe as possible.

## Part 2

Let's try to build a function that'd handle all the following for us:

```ts
const orderRemap: OrderRemap = {
  id: order.id,
  name: order.name,

  prices: getGroupedValues(order, 'price'),
  quantities: getGroupedValues(order, 'quantity'),
  shippingDates: getGroupedValues(order, 'shippingDate'),
};
```

Instead, if the types are defined as such:


```ts
interface OrderDetail {
  price: number;
  quantity: number;
  shippingDate: string;
}

interface OrderRemapGrouped {
  id: string;
  name: string;

  orderDetails: OrderDetail[]
}
```

We'd simply have to do:

```ts
declare const order: Order; // no need to know where it's coming from for the example
const orderRemapGrouped: OrderRemapGrouped = groupProperties(order, 'orderDetails');
```

If you want to give those challenges a go yourself before reading the solutions, now is a good time! You can simply open https://www.typescriptlang.org/play and eventually share the URL of your playground as a comment 😄.

# Implementation

## Part 1

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
  id: string;
  name: string;

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

Fantastic! All done then! But wait... Typescript doesn't seem to be really happy here. On our return type:

```ts
Obj[`${BaseKey}${Indices}`]
```

It says:

> Type '`${BaseKey}1` | `${BaseKey}2` | `${BaseKey}3`' cannot be used to index type 'Obj'

And it looks legit. We're trying to access properties on a generic which doesn't extends anything (our `Obj` type).  
But how can we keep this function generic and specify that our object will have keys that are composed of the base key and indices 🤔...

Would 

```ts
Obj extends Record<`${BaseKey}${Indices}`, any>
```

Work? Surely it can't work, because `BaseKey` is defined after and itself uses `Obj`:

```ts
Obj extends Record<`${BaseKey}${Indices}`, any>, BaseKey extends GroupedKeys<keyof Obj>
```

Well this is just fine for Typescript 🤯.  
Read this again.  
**It's fine to say that a given type `Obj` will be an object (`Record`) which contains keys of another type (`BaseKey`), which itself is defined by reading the keys of that `Obj`.**

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

But this? While I think it's amazing, I'm not sure how Typescript manage to settle on the type.

To wrap this up, here's the complete function (without the implementation but with all the types):

```ts
function getGroupedValues<Obj extends Record<`${BaseKey}${Indices}`, any>, BaseKey extends GroupedKeys<keyof Obj>>(
  object: Obj,
  baseKey: BaseKey,
): Array<Obj[`${BaseKey}${Indices}`]> {
  return null as any; // we're not implementing the function, just focusing on its definition
}
```

If we try it out we see the following:

```ts
// some mock for an order
const order: Order = {
  id: 'order-1',
  name: 'Order 1',

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

const orderRemap: OrderRemap = {
  id: order.id,
  name: order.name,

  prices: getGroupedValues(order, 'price') // inferred return type: `number[]`
  quantities: getGroupedValues(order, 'quantity') // inferred return type: `number[]`
  shippingDates: getGroupedValues(order, 'shippingDate') // inferred return type: `string[]`
};
```

I just tried this trick on a Friday afternoon without much hope after being stuck for a while on the error

> Type '`${BaseKey}1` | `${BaseKey}2` | `${BaseKey}3`' cannot be used to index type 'Obj'

I was amazed to see that somehow Typescript is ok with those generics defined at the same level and using each others

```ts
Obj extends Record<`${BaseKey}${Indices}`, any>, BaseKey extends GroupedKeys<keyof Obj>
```

Am I the only one? Did you know about this? Is anyone able to explain how Typescript can be ok with this? In any case leave a comment and tell me what you think about it and if this was useful 😄!

Here's the [Typescript Playground link](https://www.typescriptlang.org/play?ts=4.4.3#code/JYOwLgpgTgZghgYwgAgPJQCbWQbwLABQyyA9CcgM4D2AtigK4jACO9KA1hAJ4WHHAYAXJTBRQAcwDcfZCDh1hFUROkEZZSrQ7cKyAETioVegAcIGPcgBGXZAGZkMk2KQBGYSHo0r0VcWfASABMHl4+UH7IAUh2od6+hDKscODAYFzusmEJRMjJqekhWfERSfQpYGlcscXhqjIUABbAJiYSACJwkJlKYiBSDc2tHV0QRb0qgy1t-Z2QNRP9qgC+iQTpZsgAkiAYgRC6ALzIrsgAPshB5-b161ybAOJGpuYA0joAPAAqAHzIx19kBAAB6QXa6AAGABIcKAYNgAKrLGE7PZICjLCHIAD8yARyA8EAAbjlCBsUAAlA70AA2YH+yCexjMGHePA+nC4VBgaEw0B+klI5D00QglguenylXS4v0TWmI0glkAPBuASP21hoYFQaTSqAB3CTIYC6LqQGgmemeEonZB6xrQFB6lAQXbmZCmW1pRrIFJAqBGKCEDRfe4oADk0JwACE4BQIGzlq4sRdIzG4wmgsnkKnY-HuMs7BCw8gECkQFR6T53XGMMgwFQja7gXXQ8gw6grAArMOEGCMBCVKggZDiCBgJkvDAANTgNLYFAAgmAzRbXB8O52ADTINN52wgsEYXQTllsigc7jctBdn4-AAUVC7EAHwg326subZwl3bIAlMIF39OAuHXLsAG0c3TfMUV2fYMQhABdP58FyKAx3oKBh08HUfRNEAuEFDQnTDNDZArI1zRpCA6FSfo63tZA+xAAdgCHbdO3oJRGKoBBOMNIcjTAXQsBgUA0lYkBCFWNQCE1bVdQNOjjXox0qCgdhDSYlih17ftB2HUdx2eFkZznA5QM7IFQRdI9kCpBA1IwD5IL3ZEcFRODMW3FIuB+bcf24KzD2PYy3k+Tkrw3W87xkR9O2fMBXy7TcZA-KCuG-T9uBSgh-2QQCoGAiyIJhAKuDcjz0UxJDcBkNCwAwrDaRpXCfXwwjyGI0jy3pYBKOol1KjosAGK0-T2M4+ktV4ih+OHNJhIgUSmH0qS1iwBAaTgUiHJALjHOgV8+VKGSNB6iBhEaKgSSgFTkCJbbgDgKwqN0etKAgFARpQOFoDQ2tyUIXauNFKkjhHMcT3MUz5wfY7tzDUUw1-DqyMgbdvuzUUsW28QvEGtqAYY4wwBMeh6W2r7WwoOB4QAQiBocuKlKowYZQyoenWdYYOqAEZZ9JkdUYH6XlYZZlGNnjg50KubMig4awPm2zFmZxDmCAhcIIA) with all the code from above.

## Part 2

While creating the API in part 1, we notice that we have to call the `getGroupedValues` function multiple times, pass a key, recreate the whole object for the remaining properties, etc. It's quite heavy and... Could be simpler!

So now we'll see how to write a function which does all of this for us and groups the different properties based on their index: 

```ts
const orderRemapGrouped: OrderRemapGrouped = groupProperties(order, 'orderDetails');
```

So here, `orderDetails` will be an array containing objects of type `{price: number, quantity: number; shippingDate: string}` where the values would be coming from the same index. Example for `orderDetails[0]`, it'd have the `price`, `quantity` and `shippingDate` of `price1`, `quantity1` and `shippingDate1`. Etc.

```ts
function groupProperties<Obj extends Record<`${Keys}${Indices}`, any>, Keys extends GroupedKeys<keyof Obj>, NewKey extends string>(
  object: Obj,
  newKey: NewKey,
): Omit<Obj, `${Keys}${Indices}`> & Record<NewKey, Array<{[key in Keys]: Obj[`${key}${Indices}`]}>> {
  return null as any; // we're not implementing the function, just focusing on its definition
}
```

See some similarities here?

Exactly! The biggest difference being the return type. So let's break it down:

```ts
Omit<Obj, `${Keys}${Indices}`>
```

First, we know that the new object we return should not have any of the properties with the indices (e.g. `price1`, `price2`, `price3`). So we use the built in `Omit` type to exclude from the common keys concatenated to the indices.

Then:

```ts
Record<NewKey, Array<{[key in Keys]: Obj[`${key}${Indices}`]}>>
```

We add to the return one property, which will have the key passed as second parameter of the function (of type `NewKey`). That key, will have a value that will be an array of objects.

These objects are going to be all the common keys (`price`, `quantity` and `shippingDate`), associated to the union type of all those properties. For example if we start with `price` we'll get the union type of `price1`, `price2`, `price3`  which is `number` as they're all numbers. And same for the others.


Here's the [Typescript Playground link](https://www.typescriptlang.org/play?ts=4.4.3#code/JYOwLgpgTgZghgYwgAgPJQCbWQbwLABQyyA9CcgM4D2AtigK4jACO9KA1hAJ4WHHAYAXJTBRQAcwDcfZCDh1hFUROkEZZSrQ7cKyAETioVegAcIGPcgBGXZAGZkMk2KQBGYSHo0r0VcWfASABMHl4+UH7IAUh2od6+hDKscODAYFzusmEJRMjJqekhWfERSfQpYGlcscXhqjIUABbAJiYSACJwkJlKYiBSDc2tHV0QRb0qgy1t-Z2QNRP9qgC+iQTpZsgAkiAYgRC6ALzIrsgAPshB5-b161ybAOJGpuYA0joAPAAqAHzIx19kBAAB6QXa6AAGABIcKAYNgAKrLGE7PZICjLCHIAD8yARyA8EAAbjlCBsUAAlA70AA2YH+yCexjMGHePA+nC4VBgaEw0B+klI5D00QglguenylXS4v0TWmI0glkAPBuASP21jBGAhKlQQMhDMyAApGMxQSoHD6oKwAKyBoIg4OQVIQVEwH2hODZGJRu32GIhABpkCkuD8g167WCMLomS9WZ9Ody0Daw8gAHIQADubMjDujIj64h+AAoZFQbRBtcIrdaAzIQFm2cIM9nuHWCABKas0NKWm1Bj1e5E4VF+zF-ABkTsrrowHxbbKDAEEoFA4FwPjgANqc5CgZBegC61ZtW49nOHo-RmMPyx+f3wuSgEDA9Cges8NJpwd0IcFGkzCAAHJn1kKh6WAGgTBpCA6FSfpkDARoUE1EBtWAXUg2teglGQGAqAQHCJGQXU9zAXQsBgUA0gwkBCFWNQCCwBAaTgUCXRAXDZ2gas+VKRiNBAcCIGERoqBJKBEOQ5AiTY4A4CsGDdDAKhKAgFAkJQOFoGfDBEPuCBCA43DnyOfVnhMY0qFNc0KGLbioCDICHPaF84GAGkKCAjtbg0URbA2YiIVMgA6LEVLUjTGi6ZAuXofUX2QCEBEDJK5DoVKIRctyPIoCFCA0OBdDEiTiKaKhM2U6TKOonU9STTT9LMXRM2aBBGj3XQlN0FiIDYtZBIqoNgB5OLkBK7Asr41ywHczysVIxr8K-CriJpUAUDioCv0isjlIMwQCvIZAVzXDdHw0YgohcETahyS7iClKo4jqI6rsoIYZnEOZbsWAYCA0O9CFC7LZtywggA) with all the code from above.

# Conclusion

I didn't think that referencing 2 generics between an object and its keys (part 1) would work. But it does and for the best. The combination of that trick with template literals to extract the common bit of some properties is quite powerful and gives us robust typings on our functions to change a data structure into a fairly different one.

I just love Typescript ❤️✨. If you do as well and you found this article useful, let me know in the comments. I'd also be really interested to see some attempts/solutions from people who gave it a go!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
