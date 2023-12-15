import { rgbToStyle } from "$lib/color";
import { PixelCanvas } from "./pixel-canvas";

export class HoverCanvas extends PixelCanvas {
  drawPixel(x: number, y: number, rgbaInt: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const r = (rgbaInt >> 0) & 0xff;
    const g = (rgbaInt >> 8) & 0xff;
    const b = (rgbaInt >> 16) & 0xff;
    ctx.fillStyle = rgbToStyle(r, g, b, 0.6);
    ctx.fillRect(x, y, 1, 1);
    console.log(x, y);
  }
}
