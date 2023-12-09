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
    this.vCanvas.width = this.artWidth;
    this.vCanvas.height = this.artHeight;
    this.vCanvas.color = this.color;

    this.pCanvas = new PreviewCanvas(previewCanvas);
    this.pCanvas.width = this.artWidth * (option.dotSize / 2);
    this.pCanvas.height = this.artHeight * (option.dotSize / 2);
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
