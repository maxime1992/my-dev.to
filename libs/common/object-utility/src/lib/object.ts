// chunk([0, 1, 2, 3, 4]) --> [[0,1],[2,3],[4]]
// chunk([0, 1, 2, 3, 4, 5]) --> [[0,1],[2,3],[4,5]]
export const chunk = <T>(arr: T[]): T[][] =>
  arr.reduce<T[][]>((result, _, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []);
