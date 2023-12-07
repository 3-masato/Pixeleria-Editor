import { clamp } from "../math";
import { MAX_ALPHA, MAX_RGB, MIN_ALPHA, MIN_RGB } from "./constant";

/**
 * Clamps an RGB value to a specified range.
 *
 * This function ensures that an RGB color value is within the defined range
 * for RGB values, typically 0 to 255. If the input `rgb` value is not a finite number,
 * it defaults to 0. Otherwise, it clamps the value within the specified RGB range.
 *
 * @param {number} rgb - The RGB value to be clamped.
 * @returns {number} The clamped RGB value, or 0 if the input is not a finite number.
 */
export const clampRGB = (rgb: number): number => {
  return Number.isFinite(rgb) ? clamp(rgb, MIN_RGB, MAX_RGB) : 0;
};

/**
 * Clamps an alpha value to a specified range.
 *
 * This function ensures that an alpha channel value is within the defined range
 * for alpha values, typically 0.0 to 1.0. If the input `alpha` value is not a finite number,
 * it defaults to 0. Otherwise, it clamps the value within the specified alpha range.
 *
 * @param {number} alpha - The alpha value to be clamped.
 * @returns {number} The clamped alpha value, or 0 if the input is not a finite number.
 */
export const clampAlpha = (alpha: number): number => {
  return Number.isFinite(alpha) ? clamp(alpha, MIN_ALPHA, MAX_ALPHA) : 0;
};
