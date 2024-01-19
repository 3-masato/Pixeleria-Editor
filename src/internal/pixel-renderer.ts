import { PixelCanvas } from "../canvas/pixel-canvas";
import { PixelBuffer } from "./pixel-buffer";

/**
 * ピクセルデータを操作し、描画を行うクラス。
 */
export class PixelRenderer extends PixelBuffer {
  private readonly vCanvas: PixelCanvas;

  /**
   * @param width レンダラの幅
   * @param height レンダラの高さ
   */
  constructor(width: number, height: number) {
    super(width, height);

    this.vCanvas = new PixelCanvas(document.createElement("canvas"), width, height, 1, {
      willReadFrequently: true
    });
  }

  /**
   * レンダリングされたイメージを取得します。
   * @readonly
   */
  get image(): CanvasImageSource {
    return this.vCanvas.canvas;
  }

  /**
   * キャンバスをクリアします。
   */
  clear(): void {
    super.clear();
    this.vCanvas.clear();
  }

  /**
   * フラッドフィルアルゴリズムを使用して塗りつぶしを実行します。
   * @param x 開始点の x 座標
   * @param y 開始点の y 座標
   * @param color 塗りつぶしに使用する色
   */
  floodFill(x: number, y: number, color: number): void {
    if (!this.contain(x, y)) return;

    // 符号なし32bit整数に変換してから比較する
    const targetColor = this.get(x, y);
    const fillColor = color >>> 0;

    if (targetColor === fillColor) {
      return;
    }

    type PixelStack = Array<[number, number]>;
    const pixelStack: PixelStack = [[x, y]];

    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop()!;
      let westX = x;
      let eastX = x;

      while (westX >= 0 && this.get(westX, y) === targetColor) {
        westX--;
      }
      while (eastX < this.width && this.get(eastX, y) === targetColor) {
        eastX++;
      }

      for (let i = westX + 1; i < eastX; i++) {
        this.set(i, y, fillColor);

        if (y > 0 && this.get(i, y - 1) === targetColor) {
          pixelStack.push([i, y - 1]);
        }
        if (y < this.height - 1 && this.get(i, y + 1) === targetColor) {
          pixelStack.push([i, y + 1]);
        }
      }
    }
  }

  /**
   * ピクセルデータをキャンバスに描画します。
   */
  render(): void {
    const ctx = this.vCanvas.ctx;
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    const pixelData = new Uint8ClampedArray(this.pixelData.buffer);

    data.set(pixelData, 0);
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * キャンバスの内容をデータ URL として取得します。
   * @param type - イメージの形式。
   * @param quality - イメージの品質（形式が 'image/jpeg' または 'image/webp' の場合のみ）。
   * @returns - データURL。
   */
  toDataURL(type?: string, quality?: any): string {
    const canvas = this.vCanvas.canvas;
    return canvas.toDataURL(type, quality);
  }
}
