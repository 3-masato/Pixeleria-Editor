import { PixelCanvas } from "./pixel-canvas";

export class PreviewCanvas extends PixelCanvas {
  constructor(...args: ConstructorParameters<typeof PixelCanvas>) {
    super(...args);
    this.ctx.imageSmoothingEnabled = false;
  }
}
