import type { NumericArray } from "src/type";

export const encodeRLE = (inputArray: NumericArray): number[] => {
  const length = inputArray.length;
  if (length === 0) return [];

  const encodedArray: number[] = [];
  let prev = inputArray[0];
  let count = 1;

  for (let i = 1; i < length; i++) {
    if (inputArray[i] === prev) {
      count++;
    } else {
      encodedArray.push(prev, count);
      prev = inputArray[i];
      count = 1;
    }
  }

  encodedArray.push(prev, count);
  return encodedArray;
};

export const decodeRLE = (inputArray: NumericArray): number[] => {
  const length = inputArray.length;
  if (length === 0) return [];

  const decodedArray: number[] = [];

  for (let i = 0; i < length; i += 2) {
    const value = inputArray[i];
    const count = inputArray[i + 1];

    for (let j = 0; j < count; j++) {
      decodedArray.push(value);
    }
  }

  return decodedArray;
};
