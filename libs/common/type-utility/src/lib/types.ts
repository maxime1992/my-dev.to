// @todo use tsdef instead of this

export type Nil = null | undefined;

// this function lets us add type safety in our
// switch conditions
// to use it, do:
// -------------------------------
// switch (myVar) {
//   ...
//   default:
//     unreachableCaseWrap(myVar);
// }
// -------------------------------
// if you don't implement all the cases, you
// won't have any error at run time (at least here)
// but you'll have an error at compile time with TS
export const unreachableCaseWrap = (value: never) => {};

// this function lets us add type safety in our
// switch conditions
// to use it, do:
// -------------------------------
// switch (myVar) {
//   ...
//   default:
//     throw new UnreachableCase(myVar);
// }
// -------------------------------
// if you don't implement all the cases, you'll
// have an error at compile time with TS and also
// an error at run time (as we do `throw` in the example)
export class UnreachableCase {
  constructor(value: never) {}
}

export type Nullable<T> = T | null;

export type NullableProps<T> = { [P in keyof T]: T[P] | null };

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
