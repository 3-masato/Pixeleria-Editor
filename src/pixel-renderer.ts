import { decodeRLE, encodeRLE } from "$lib/rle";
import { getCanvasContext } from "./canvas-context";
import { PixelBuffer } from "./pixel-buffer";

export class PixelRenderer extends PixelBuffer {
  readonly COMPRESSER_VERSION = 1;

  readonly vCanvas: HTMLCanvasElement;
  private readonly vContext: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    super(width, height);

    const { canvas, ctx } = getCanvasContext(document.createElement("canvas"), {
      willReadFrequently: true,
    });

    this.vCanvas = canvas;
    this.vContext = ctx;
    this.vContext.imageSmoothingEnabled = false;
  }

  render() {
    const imageData = this.vContext.createImageData(this.width, this.height);
    const data = imageData.data;
    const pixelData = new Uint8ClampedArray(this.pixelData.buffer);

    data.set(pixelData, 0);
    this.vContext.putImageData(imageData, 0, 0);
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
    const { width, height } = this.vCanvas;
    const imageData = this.vContext.getImageData(0, 0, width, height);
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

    const imageData = this.vContext.createImageData(width, height);

    imageData.data.set(decodedArray, 0);
    this.vContext.putImageData(imageData, 0, 0);

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
    return this.vCanvas.toDataURL(type, quality);
  }
}
