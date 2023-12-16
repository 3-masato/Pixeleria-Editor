import type { PaintMode } from "$types/shared";
import { InteractiveRenderer } from "./interactive-renderer";
import { PixelCanvas } from "./pixel-canvas";
import type { PixelRenderer } from "./pixel-renderer";

export type DrawCanvasOption = {
  width: number;
  height: number;
  dotSize: number;
};

export class DrawCanvas {
  public readonly width: number;
  public readonly height: number;

  public readonly targetCanvas: PixelCanvas;
  public readonly previewCanvas: PixelCanvas;

  private readonly interactiveRenderer: InteractiveRenderer;
  private readonly pixelRenderer: PixelRenderer;

  constructor(
    targetCanvas: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    const { width, height, dotSize } = option;
    this.width = width;
    this.height = height;

    this.targetCanvas = new PixelCanvas(targetCanvas, width, height, dotSize);
    this.previewCanvas = new PixelCanvas(previewCanvas, width, height, dotSize / 2);

    this.interactiveRenderer = new InteractiveRenderer(
      this.targetCanvas,
      (renderer) => {
        this.previewCanvas.draw(renderer.image);
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
    const confirmResult = window.confirm("Clear the canvas?");
    if (!confirmResult) return;

    this.interactiveRenderer.clear();
    this.targetCanvas.clear();
    this.previewCanvas.clear();
  }

  getImageDataURI(): string {
    return this.pixelRenderer.toDataURL("image/png");
  }

  loadPixelData(data: Uint32Array): boolean {
    const requiredLength = this.width * this.height * 4;
    if (data.buffer.byteLength !== requiredLength) {
      return false;
    }

    this.pixelRenderer.pixelData.set(data, 0);
    return true;
  }

  getPixelData(): {
    pixelData: Uint32Array;
    width: number;
    height: number;
  } {
    return {
      pixelData: this.pixelRenderer.pixelData,
      width: this.width,
      height: this.height,
    };
  }
}
