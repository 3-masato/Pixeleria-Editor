import type { PaintMode } from "$types/shared";
import { InteractiveRenderer } from "./interactive-renderer";
import { PixelCanvas } from "./pixel-canvas";
import { PixelRenderer } from "./pixel-renderer";

export type DrawCanvasOption = {
  width: number;
  height: number;
  dotSize: number;
};

export class DrawCanvas {
  public readonly width: number;
  public readonly height: number;
  public readonly dotSize: number;

  public readonly dCanvas: PixelCanvas;
  public readonly pCanvas: PixelCanvas;

  private interactiveRenderer: InteractiveRenderer;
  private pixelRenderer: PixelRenderer;

  constructor(
    target: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    const { width, height, dotSize } = option;
    this.width = width;
    this.height = height;
    this.dotSize = dotSize;

    this.dCanvas = new PixelCanvas(target, width, height, dotSize);
    this.pCanvas = new PixelCanvas(previewCanvas, width, height, dotSize / 2);

    this.interactiveRenderer = new InteractiveRenderer(
      this.dCanvas.canvas,
      width,
      height,
      dotSize,
      (renderer) => {
        this.dCanvas.draw(renderer.image);
        this.pCanvas.draw(renderer.image);
      }
    );

    this.pixelRenderer = this.interactiveRenderer.pixelRenderer;
  }

  set paintMode(paintMode: PaintMode) {
    this.interactiveRenderer.paintMode = paintMode;
  }

  get paintMode() {
    return this.interactiveRenderer.paintMode;
  }

  set colorInt(colorInt: number) {
    this.interactiveRenderer.colorInt = colorInt;
  }

  get colorInt() {
    return this.interactiveRenderer.colorInt;
  }

  clearCanvas() {
    this.pixelRenderer.clear();
    this.dCanvas.clear();
    this.pCanvas.clear();
  }

  getCompressedData(): Uint32Array {
    return this.pixelRenderer.getCompressedData();
  }

  getImageDataURI(): string {
    return this.pixelRenderer.toDataURL("image/png");
  }
}
