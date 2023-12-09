import { DrawCanvas, type DrawCanvasOption } from "./canvas/draw-canvas";
import { VirtualCanvas } from "./canvas/virtual-canvas";

export type PixelArtEventMap = {
  save: Uint32Array;
};

export class PixelArtEditor extends DrawCanvas {
  readonly vCanvas: VirtualCanvas;

  constructor(canvas: HTMLCanvasElement, option: DrawCanvasOption) {
    super(canvas, option);

    this.vCanvas = new VirtualCanvas();
    this.vCanvas.width = this.artWidth;
    this.vCanvas.height = this.artHeight;
    this.vCanvas.color = this.color;
  }

  setColor(color: string) {
    this.vCanvas.color = this.color = color;
  }

  draw(x: number, y: number): void {
    super.draw(x, y);
    this.vCanvas.draw(x, y);
  }

  getCompressedData(): Uint32Array {
    return this.vCanvas.getCompressedData();
  }
}
