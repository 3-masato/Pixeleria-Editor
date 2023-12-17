import { getCanvasContext } from "../util/canvas-context";
import { PixelCanvas } from "./pixel-canvas";

export class BackgroundCanvas extends PixelCanvas {
  constructor(...args: ConstructorParameters<typeof PixelCanvas>) {
    super(...args);
    this.ctx.imageSmoothingEnabled = false;
  }

  public drawBackground() {
    const patternCanvas = this.createCheckerboardPattern();
    this.fillCanvasWithPattern(patternCanvas);
  }

  private createCheckerboardPattern() {
    const { canvas: checkerboardCanvas, ctx } = getCanvasContext(
      document.createElement("canvas")
    );
    const patternSize = 2;
    checkerboardCanvas.width = patternSize;
    checkerboardCanvas.height = patternSize;

    this.drawCheckerboardSquares(ctx, patternSize);
    return checkerboardCanvas;
  }

  private drawCheckerboardSquares(ctx: CanvasRenderingContext2D, size: number) {
    ctx.fillStyle = "rgb(255 255 255 / 0.1)";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "rgb(0 0 0 / 0.1)";
    ctx.fillRect(0, 0, size / 2, size / 2);
    ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
  }

  private fillCanvasWithPattern(patternCanvas: HTMLCanvasElement) {
    const pattern = this.ctx.createPattern(patternCanvas, "repeat");
    if (!pattern) {
      throw new Error("Failed to create pattern");
    }
    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
