import { DrawCanvas, type DrawCanvasOption } from "./canvas/draw-canvas";
import { PreviewCanvas } from "./canvas/preview-canvas";
import { VirtualCanvas } from "./canvas/virtual-canvas";

export type PixelArtEventMap = {
  save: {
    pixelData: Uint32Array;
    imageData: string;
  };
  clear: void;
};

/**
 * ピクセルバッファを表すクラス
 */
class Pixel {
  /** ピクセルバッファの幅 */
  width: number;

  /** ピクセルバッファの高さ */
  height: number;

  /** ピクセルデータを格納するバッファ */
  buffer: Uint32Array;

  /**
   * Pixel インスタンスを作成します。
   *
   * @param {number} width - ピクセルバッファの幅
   * @param {number} height - ピクセルバッファの高さ
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint32Array(width * height);
  }

  /**
   * 指定された座標のピクセル色を設定します。
   *
   * @param {number} x - ピクセルのx座標
   * @param {number} y - ピクセルのy座標
   * @param {number} color - 指定座標に設定する色
   */
  set(x: number, y: number, color: number): void {
    if (!this.contain(x, y)) return;
    this.buffer[y * this.width + x] = color;
  }

  /**
   * 指定された座標のピクセル色を取得します。
   *
   * @param {number} x - ピクセルのx座標
   * @param {number} y - ピクセルのy座標
   * @returns {number | undefined} 指定された座標の色、または範囲外の場合は `undefined`
   */
  get(x: number, y: number): number | undefined {
    if (!this.contain(x, y)) return undefined;
    return this.buffer[y * this.width + x];
  }

  /**
   * 指定された座標がバッファの範囲内にあるかどうかを確認します。
   * @param {number} x - 確認するx座標
   * @param {number} y - 確認するy座標
   * @returns {boolean} 座標が範囲内の場合は `true`、そうでない場合は `false`
   */
  contain(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
}

export class PixelArtEditor extends DrawCanvas {
  readonly vCanvas: VirtualCanvas;
  readonly pCanvas: PreviewCanvas;
  readonly pixel: Pixel;

  constructor(
    drawCanvas: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    super(drawCanvas, option);

    this.vCanvas = new VirtualCanvas();
    this.vCanvas.size(this.artWidth, this.artHeight);
    this.vCanvas.color = this.color;

    this.pCanvas = new PreviewCanvas(previewCanvas);
    this.pCanvas.size(
      this.artWidth * (option.dotSize / 2),
      this.artHeight * (option.dotSize / 2)
    );
    this.pCanvas.color = this.color;
    this.pCanvas.ctx.scale(option.dotSize / 2, option.dotSize / 2);

    this.pixel = new Pixel(this.artWidth, this.artHeight);
  }

  setColor(color: string) {
    this.color = color;
    this.vCanvas.color = color;
    this.pCanvas.color = color;
  }

  draw(x: number, y: number): void {
    super.draw(x, y);
    this.vCanvas.draw(x, y);
    this.pCanvas.draw(x, y);
  }

  erase(x: number, y: number): void {
    super.erase(x, y);
    this.vCanvas.erase(x, y);
    this.pCanvas.erase(x, y);
  }

  clear() {
    const confirmResult = window.confirm("Clear the canvas?");

    if (!confirmResult) return;

    super.clear();
    this.vCanvas.clear();
    this.pCanvas.clear();
  }

  getCompressedData(): Uint32Array {
    return this.vCanvas.getCompressedData();
  }

  getImageDataURI(): string {
    return this.vCanvas.toDataURL("image/png");
  }
}
