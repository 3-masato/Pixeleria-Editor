import { clampAlpha, clampRGB } from "$lib/color";
import { describe, expect, it } from "vitest";

describe("clampRGB function", () => {
  it("clamps within the RGB range", () => {
    expect(clampRGB(100)).toBe(100);
    expect(clampRGB(-20)).toBe(0);
    expect(clampRGB(300)).toBe(255);
  });

  it("returns 0 for non-finite numbers", () => {
    expect(clampRGB(NaN)).toBe(0);
    expect(clampRGB(Infinity)).toBe(0);
    expect(clampRGB(-Infinity)).toBe(0);
  });
});

describe("clampAlpha function", () => {
  it("clamps within the alpha range", () => {
    expect(clampAlpha(0.5)).toBe(0.5);
    expect(clampAlpha(-1)).toBe(0.0);
    expect(clampAlpha(1.5)).toBe(1.0);
  });

  it("returns 0 for non-finite numbers", () => {
    expect(clampAlpha(NaN)).toBe(0);
    expect(clampAlpha(Infinity)).toBe(0);
    expect(clampAlpha(-Infinity)).toBe(0);
  });
});
