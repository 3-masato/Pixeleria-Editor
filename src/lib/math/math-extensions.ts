// See: https://github.com/rwaldron/proposal-math-extensions

/**
 * Clamps a number to a specified range.
 *
 * This function limits the value of `x` to be within the range defined by
 * `minValue` and `maxValue`. If `x` is less than `minValue`, it returns
 * `minValue`. If `x` is greater than `maxValue`, it returns `maxValue`.
 * Otherwise, it returns `x`.
 *
 * @param {number} x - The number to be clamped.
 * @param {number} minValue - The minimum value to which `x` can be clamped.
 * @param {number} maxValue - The maximum value to which `x` can be clamped.
 * @returns {number} The clamped value of `x`.
 */
export const clamp = (x: number, minValue: number, maxValue: number): number => {
  return Math.min(maxValue, Math.max(minValue, x));
};

/**
 * Scales a number from one range to another.
 *
 * This function takes a number `x` and maps it from the range [`inLow`, `inHigh`]
 * to a new range [`outLow`, `outHigh`]. The function handles edge cases: if any
 * input is not a number (NaN), it returns NaN. If `x` is Infinity or -Infinity,
 * it returns the same value.
 *
 * @param {number} x - The number to be scaled.
 * @param {number} inLow - The lower bound of the input range.
 * @param {number} inHigh - The upper bound of the input range.
 * @param {number} outLow - The lower bound of the output range.
 * @param {number} outHigh - The upper bound of the output range.
 * @returns {number} The scaled number, or NaN if inputs are not valid numbers.
 */
export const scale = (
  x: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
) => {
  const nx = Number(x);
  const nInLow = Number(inLow);
  const nInHigh = Number(inHigh);
  const nOutLow = Number(outLow);
  const nOutHigh = Number(outHigh);
  if (
    nx !== nx ||
    nInLow !== nInLow ||
    nInHigh !== nInHigh ||
    nOutLow !== nOutLow ||
    nOutHigh !== nOutHigh
  ) {
    return NaN;
  }
  if (nx === Infinity || nx === -Infinity) {
    return nx;
  }
  return ((nx - nInLow) * (nOutHigh - nOutLow)) / (nInHigh - nInLow) + nOutLow;
};
