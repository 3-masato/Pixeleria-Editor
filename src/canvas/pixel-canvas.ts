import { getCanvasContext } from "../util/canvas-context";

export class PixelCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  constructor(
    target: HTMLCanvasElement,
    readonly width: number,
    readonly height: number,
    readonly dotSize: number = 1,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    const { canvas, ctx } = getCanvasContext(target, contextOption);
    this.canvas = canvas;
    this.ctx = ctx;

    this.resize(width, height, dotSize);
  }

  resize(width: number, height: number, dotSize: number) {
    this.canvas.width = width * dotSize;
    this.canvas.height = height * dotSize;
    this.ctx.scale(dotSize, dotSize);
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
