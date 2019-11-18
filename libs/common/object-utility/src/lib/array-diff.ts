export interface ArrayDiff<T> {
  unchanged: T[];
  added: T[];
  deleted: T[];
}

export const arrToMap = <T, U>(arr: T[], selector: (value: T) => U): Map<U, T> =>
  arr.reduce((acc, curr) => {
    acc.set(selector(curr), curr);
    return acc;
  }, new Map<U, T>());

export const arrayDiff = <T>(arr1: T[], arr2: T[], selectUniqIdentifier: (value: T) => any): ArrayDiff<T> => {
  const arr2ToMap: Map<any, T> = arrToMap(arr2, selectUniqIdentifier);

  const itemHandled: Set<any> = new Set();

  const res: ArrayDiff<T> = arr1.reduce(
    (acc, v1) => {
      const uniqIdentifier = selectUniqIdentifier(v1);
      if (arr2ToMap.has(uniqIdentifier)) {
        acc.unchanged.push(v1);
      } else {
        acc.deleted.push(v1);
      }
      itemHandled.add(uniqIdentifier);
      return acc;
    },
    {
      unchanged: [],
      added: [],
      deleted: [],
    } as ArrayDiff<T>,
  );

  arr2ToMap.forEach(v2 => {
    const uniqIdentifier = selectUniqIdentifier(v2);

    if (!itemHandled.has(uniqIdentifier)) {
      res.added.push(v2);
    }
  });

  return res;
};
