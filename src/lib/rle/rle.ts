import type { NumericArray } from "src/type";

/**
 * Encodes a numeric array using Run-Length Encoding (RLE).
 *
 * @param {NumericArray} inputArray - Array of numbers to encode.
 * @returns {number[]} RLE encoded array.
 */
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

/**
 * Decodes an RLE encoded numeric array.
 *
 * @param {NumericArray} inputArray - RLE encoded array.
 * @returns {number[]} Decoded array.
 */
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
