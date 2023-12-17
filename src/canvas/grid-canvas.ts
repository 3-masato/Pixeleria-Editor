import { PixelCanvas } from "./pixel-canvas";

export class GridCanvas extends PixelCanvas {
  drawGrid(dotSize: number) {
    const { width, height, ctx } = this;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#0ea5e9";

    ctx.beginPath();

    for (let x = 1; x < width; x++) {
      const dx = x * dotSize;
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx, height);
    }

    for (let y = 1; y < height; y++) {
      const dy = y * dotSize;
      ctx.moveTo(0, dy);
      ctx.lineTo(width, dy);
    }

    ctx.stroke();
  }
}
