export abstract class PixelCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  /** CSS color string */
  private _color: string = "#000000";

  constructor(
    canvas: HTMLCanvasElement,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d", contextOption);
    if (ctx === null) {
      throw new Error(
        "Failed to get the 2D context. Ensure the canvas element is correctly initialized and your browser supports the 2D context."
      );
    }

    this.ctx = ctx;
  }

  set color(color: string) {
    this._color = color;
  }

  get color(): string {
    return this._color;
  }

  size(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  draw(x: number, y: number): void {
    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(x, y, 1, 1);
    this.ctx.restore();
  }

  erase(x: number, y: number): void {
    this.ctx.clearRect(x, y, 1, 1);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
