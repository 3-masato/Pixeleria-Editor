import { rgbToInt } from "$lib/color";
import chroma from "chroma-js";
import { DrawCanvas, type DrawCanvasOption } from "./canvas/draw-canvas";

export type PixelArtEventMap = {
  save: {
    pixelData: Uint32Array;
    imageData: string;
  };
  clear: void;
};

export class Editor extends DrawCanvas {
  constructor(
    drawCanvas: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    super(drawCanvas, previewCanvas, option);
  }

  setColor(color: string) {
    const chromaColor = chroma(color);
    const rgb = chromaColor.rgb();
    const colorInt = rgbToInt(rgb[2], rgb[1], rgb[0]);

    this.colorInt = colorInt;
  }
}
