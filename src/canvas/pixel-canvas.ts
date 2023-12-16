import { getCanvasContext } from "./canvas-context";

export class PixelCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  constructor(
    target: HTMLCanvasElement,
    readonly width: number,
    readonly height: number,
    readonly resolution: number = 1,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    const { canvas, ctx } = getCanvasContext(target, contextOption);
    this.canvas = canvas;
    this.ctx = ctx;

    this.resize(width, height, resolution);
    this.ctx.imageSmoothingEnabled = false;
  }

  resize(width: number, height: number, resolution: number) {
    this.canvas.width = width * resolution;
    this.canvas.height = height * resolution;
    this.ctx.scale(resolution, resolution);
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
