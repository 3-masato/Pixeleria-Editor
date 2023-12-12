import { getCanvasContext } from "src/canvas-context";

export class PixelCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  constructor(
    target: HTMLCanvasElement,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    const { canvas, ctx } = getCanvasContext(target, contextOption);
    this.canvas = canvas;
    this.ctx = ctx;
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
}
