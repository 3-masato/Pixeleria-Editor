import { DrawCanvas, type DrawCanvasOption } from "./canvas/draw-canvas";
import { PreviewCanvas } from "./canvas/preview-canvas";
import { VirtualCanvas } from "./canvas/virtual-canvas";

export type PixelArtEventMap = {
  save: {
    pixelData: Uint32Array;
    imageData: string;
  };
  clear: void;
};

class Pixel {
  width: number;
  height: number;
  buffer: Uint32Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint32Array(width * height);
  }

  set(x: number, y: number, color: number): void {
    if (!this.contain(x, y)) return;
    this.buffer[y * this.width + x] = color;
  }

  get(x: number, y: number): number | undefined {
    if (!this.contain(x, y)) return undefined;
    return this.buffer[y * this.width + x];
  }

  contain(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
}

export class PixelArtEditor extends DrawCanvas {
  readonly vCanvas: VirtualCanvas;
  readonly pCanvas: PreviewCanvas;

  constructor(
    drawCanvas: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    super(drawCanvas, option);

    this.vCanvas = new VirtualCanvas();
    this.vCanvas.size(this.artWidth, this.artHeight);
    this.vCanvas.color = this.color;

    this.pCanvas = new PreviewCanvas(previewCanvas);
    this.vCanvas.size(
      this.artWidth * (option.dotSize / 2),
      this.artHeight * (option.dotSize / 2)
    );
    this.pCanvas.color = this.color;
    this.pCanvas.ctx.scale(option.dotSize / 2, option.dotSize / 2);
  }

  setColor(color: string) {
    this.color = color;
    this.vCanvas.color = color;
    this.pCanvas.color = color;
  }

  draw(x: number, y: number): void {
    super.draw(x, y);
    this.vCanvas.draw(x, y);
    this.pCanvas.draw(x, y);
  }

  erase(x: number, y: number): void {
    super.erase(x, y);
    this.vCanvas.erase(x, y);
    this.pCanvas.erase(x, y);
  }

  clear() {
    const confirmResult = window.confirm("Clear the canvas?");

    if (!confirmResult) return;

    super.clear();
    this.vCanvas.clear();
    this.pCanvas.clear();
  }

  getCompressedData(): Uint32Array {
    return this.vCanvas.getCompressedData();
  }

  getImageDataURI(): string {
    return this.vCanvas.toDataURL("image/png");
  }
}
