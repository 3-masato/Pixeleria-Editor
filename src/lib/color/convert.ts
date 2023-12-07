import { scale } from "../math";
import { clampAlpha, clampRGB } from "./clamp";
import { MAX_ALPHA, MAX_RGB, MIN_ALPHA, MIN_RGB } from "./constant";

/**
 * Converts RGB color components into a hex integer representation.
 *
 * This function accepts red, green, and blue color components, each clamped to
 * the valid RGB range (0-255), and combines them into a hex integer.
 * The resulting integer represents the RGB color in a format commonly used in
 * digital color representation.
 *
 * @param {number} r - The red component of the color.
 * @param {number} g - The green component of the color.
 * @param {number} b - The blue component of the color.
 * @returns {number} The hex integer representation of the RGB color.
 */
export const rgbToInt = (r: number, g: number, b: number): number => {
  const rr = clampRGB(Math.round(r));
  const gg = clampRGB(Math.round(g));
  const bb = clampRGB(Math.round(b));

  return (rr << 16) | (gg << 8) | (bb << 0);
};

/**
 * Converts RGB values (and optional alpha) to a hex color string.
 *
 * This function converts red, green, and blue values to a hex color string.
 * If an alpha value is provided and is not 1, the function includes it in the resulting
 * string. The RGB values are first converted to a hex integer and then to a hex string.
 * The alpha value, if included, is scaled and converted to a two-digit hex representation.
 *
 * @param {number} r - The red component of the color.
 * @param {number} g - The green component of the color.
 * @param {number} b - The blue component of the color.
 * @param {number} [a=1] - The alpha component of the color.
 * @returns {string} The hex color string.
 */
export const rgbToHex = (
  r: number,
  g: number,
  b: number,
  a: number = 1
): string => {
  const padHex = (value: number) => `00${value.toString(16)}`.slice(-2);

  const rr = padHex(clampRGB(Math.round(r)));
  const gg = padHex(clampRGB(Math.round(g)));
  const bb = padHex(clampRGB(Math.round(b)));
  const alphaHex =
    a === 1
      ? ""
      : padHex(
          Math.round(scale(clampAlpha(a), MIN_ALPHA, MAX_ALPHA, MIN_RGB, MAX_RGB))
        );

  return `#${rr}${gg}${bb}${alphaHex}`;
};

/**
 * Converts RGB and optional alpha values to a CSS color string using the space-separated rgb() syntax.
 *
 * This function formats red, green, blue, and optionally alpha values into a CSS-compatible
 * color string using the modern space-separated `rgb()` syntax. The RGB values are clamped
 * to the valid range. The alpha value, if provided, is clamped, and then rounded to two decimal places.
 *
 * @param {number} r - The red component of the color.
 * @param {number} g - The green component of the color.
 * @param {number} b - The blue component of the color.
 * @param {number} [a=1] - The alpha component of the color.
 * @returns {string} The CSS color string in the modern space-separated `rgb()` syntax.
 */
export const rgb2style = (
  r: number,
  g: number,
  b: number,
  a: number = 1
): string => {
  const rr = clampRGB(r);
  const gg = clampRGB(g);
  const bb = clampRGB(b);
  const aa = Math.round(clampAlpha(a) * 100) / 100;

  return `rgb(${rr} ${gg} ${bb} / ${aa})`;
};
