import { getCanvasContext } from "./canvas-context";

export class PixelCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  constructor(
    target: HTMLCanvasElement,
    width: number,
    height: number,
    resolution: number,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    const { canvas, ctx } = getCanvasContext(target, contextOption);
    this.canvas = canvas;
    this.ctx = ctx;

    this.width = width * resolution;
    this.height = height * resolution;
    this.ctx.scale(resolution, resolution);
    this.ctx.imageSmoothingEnabled = false;
  }

  set width(width: number) {
    this.canvas.width = width;
  }

  get width(): number {
    return this.canvas.width;
  }

  set height(height: number) {
    this.canvas.height = height;
  }

  get height(): number {
    return this.canvas.height;
  }

  draw(image: CanvasImageSource): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    this.ctx.drawImage(image, 0, 0);
    this.ctx.restore();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
