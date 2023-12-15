import { decodeRLE, encodeRLE } from "$lib/rle";
import { PixelBuffer } from "./pixel-buffer";
import { PixelCanvas } from "./pixel-canvas";

export class PixelRenderer extends PixelBuffer {
  public readonly COMPRESSER_VERSION = 1;

  private readonly vCanvas: PixelCanvas;

  constructor(width: number, height: number) {
    super(width, height);

    this.vCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1,
      { willReadFrequently: true }
    );
  }

  get image(): CanvasImageSource {
    return this.vCanvas.canvas;
  }

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
  floodFill(x: number, y: number, color: number) {
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

  render(): void {
    const ctx = this.vCanvas.ctx;
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    const pixelData = new Uint8ClampedArray(this.pixelData.buffer);

    data.set(pixelData, 0);
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * canvasの描画データを圧縮して `Uint32Array` で返すメソッド。
   * canvasのピクセルデータを取得し、RLEアルゴリズムを用いて圧縮する。
   * 圧縮されたデータには、圧縮アルゴリズムのバージョン、圧縮後のデータ長、
   * canvasの幅と高さの情報も含まれる。
   *
   * @returns {Uint32Array} 圧縮されたcanvasのデータ。
   */
  getCompressedData(): Uint32Array {
    const { width, height, ctx } = this.vCanvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    return this._compress(data.buffer, width, height);
  }

  decompressData(compressed: Uint32Array): { width: number; height: number } {
    const width = compressed.at(-2)!;
    const height = compressed.at(-1)!;

    this.vCanvas.width = width;
    this.vCanvas.height = height;

    const compresserVersion = compressed[0];

    if (this.COMPRESSER_VERSION !== compresserVersion) {
      // TODO
    }

    const encodedArrayLength = compressed[1];
    const encodedArray = compressed.slice(2, encodedArrayLength + 2);

    const decodedArray = decodeRLE(encodedArray);

    const ctx = this.vCanvas.ctx;
    const imageData = ctx.createImageData(width, height);

    imageData.data.set(decodedArray, 0);
    ctx.putImageData(imageData, 0, 0);

    return { width, height };
  }

  /**
   * 与えられた画像データ(`ArrayBuffer`)を圧縮して `Uint32Array` で返すプライベートメソッド。
   * RLE方式で圧縮し、圧縮されたデータの先頭には圧縮アルゴリズムのバージョンとデータ長を追加する。
   * 末尾にはcanvasの幅と高さを追加する。
   *
   * @param {ArrayBuffer} buffer - 圧縮する画像データの `ArrayBuffer`。
   * @param {number} width - canvasの幅。
   * @param {number} height - canvasの高さ。
   * @returns {Uint32Array} 圧縮されたデータ。
   */
  private _compress(
    buffer: ArrayBuffer,
    width: number,
    height: number
  ): Uint32Array {
    const encodedArray = encodeRLE(new Uint32Array(buffer));
    const encodedArrayLength = encodedArray.length;

    const compressed = new Uint32Array(encodedArrayLength + 4);

    compressed.set([this.COMPRESSER_VERSION, encodedArrayLength], 0);
    compressed.set(encodedArray, 2);
    compressed.set([width, height], encodedArrayLength + 2);

    return compressed;
  }

  toDataURL(type?: string, quality?: any): string {
    const canvas = this.vCanvas.canvas;
    return canvas.toDataURL(type, quality);
  }
}
