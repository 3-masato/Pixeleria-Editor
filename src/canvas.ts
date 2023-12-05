import type { PaintMode, Vec2 } from "./type";

export type PixelArtEditorOption = {
  width: number;
  height: number;
  dotSize: number;
};
export class PixelArtEditor {
  mode: PaintMode = "pen";
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dotSize: number;

  constructor(canvas: HTMLCanvasElement, option: PixelArtEditorOption) {
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) {
      throw new Error(
        "Failed to get the 2D context. Ensure the canvas element is correctly initialized and your browser supports the 2D context."
      );
    }

    this.ctx = ctx;
    this.width = option.width;
    this.height = option.height;
    this.dotSize = option.dotSize;

    this.canvas.width = this.width * this.dotSize;
    this.canvas.height = this.height * this.dotSize;

    this.ctx.scale(this.dotSize, this.dotSize);
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(x: number, y: number) {
    this.ctx.save();
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillRect(x, y, 1, 1);
    this.ctx.restore();
  }

  getRelativeCoord(x: number, y: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: Math.trunc((x - rect.left) / this.dotSize),
      y: Math.trunc((y - rect.top) / this.dotSize),
    };
  }
}
