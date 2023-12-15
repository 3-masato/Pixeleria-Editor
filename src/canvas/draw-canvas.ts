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

  public readonly targetCanvas: PixelCanvas;
  public readonly previewCanvas: PixelCanvas;

  public readonly drawCanvas: PixelCanvas;
  public readonly hoverCanvas: PixelCanvas;
  public readonly backgroundCanvas: PixelCanvas;
  public readonly gridCanvas: PixelCanvas;

  private interactiveRenderer: InteractiveRenderer;
  private pixelRenderer: PixelRenderer;

  constructor(
    targetCanvas: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    const { width, height, dotSize } = option;
    this.width = width;
    this.height = height;
    this.dotSize = dotSize;

    this.backgroundCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.gridCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.drawCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.hoverCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );

    this.targetCanvas = new PixelCanvas(targetCanvas, width, height, dotSize);
    this.previewCanvas = new PixelCanvas(previewCanvas, width, height, dotSize / 2);

    this.interactiveRenderer = new InteractiveRenderer(
      this.targetCanvas.canvas,
      width,
      height,
      dotSize,
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

  getCompressedData(): Uint32Array {
    return this.pixelRenderer.getCompressedData();
  }

  getImageDataURI(): string {
    return this.pixelRenderer.toDataURL("image/png");
  }
}
