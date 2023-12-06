import { clamp, scale } from "$lib/math";
import { describe, expect, it } from "vitest";

describe("clamp function", () => {
  it("returns x if within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns minValue if x is less than minValue", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("returns maxValue if x is greater than maxValue", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("scale function", () => {
  it("scales the number correctly", () => {
    expect(scale(5, 0, 10, 0, 100)).toBe(50);
  });

  it("returns NaN if any input is NaN", () => {
    expect(scale(NaN, 0, 10, 0, 100)).toBeNaN();
  });

  it("handles Infinity correctly", () => {
    expect(scale(Infinity, 0, 10, 0, 100)).toBe(Infinity);
  });

  it("handles -Infinity correctly", () => {
    expect(scale(-Infinity, 0, 10, 0, 100)).toBe(-Infinity);
  });

  it("handles zero input range", () => {
    expect(scale(5, 0, 0, 0, 100)).toBe(Infinity);
    expect(scale(5, 0, 10, 0, 0)).toBe(0);
  });
});
