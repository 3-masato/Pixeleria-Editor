import { PixelCanvas } from "./pixel-canvas";

export class DrawCanvas extends PixelCanvas {
  constructor(...args: ConstructorParameters<typeof PixelCanvas>) {
    super(...args);
    this.ctx.imageSmoothingEnabled = false;
  }
}
