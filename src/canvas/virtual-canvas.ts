import { decodeRLE, encodeRLE } from "$lib/rle";
import { PixelCanvas } from "./pixel-canvas";

export class VirtualCanvas extends PixelCanvas {
  readonly COMPRESSER_VERSION = 1;

  constructor() {
    const canvas = document.createElement("canvas");
    super(canvas, {
      // このクラスでは圧縮や解凍などの操作でcanvasのデータを頻繁に読み取るため `willReadFrequently: true` を指定する。
      willReadFrequently: true,
    });
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
    const { width, height } = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    return this._compress(data.buffer, width, height);
  }

  decompressData(compressed: Uint32Array): { width: number; height: number } {
    const width = compressed.at(-2)!;
    const height = compressed.at(-1)!;

    this.canvas.width = width;
    this.canvas.height = height;

    const compresserVersion = compressed[0];

    if (this.COMPRESSER_VERSION !== compresserVersion) {
      // TODO
    }

    const encodedArrayLength = compressed[1];
    const encodedArray = compressed.slice(2, encodedArrayLength + 2);

    const decodedArray = decodeRLE(encodedArray);

    const imageData = this.ctx.createImageData(width, height);

    imageData.data.set(decodedArray, 0);
    this.ctx.putImageData(imageData, 0, 0);

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
}
