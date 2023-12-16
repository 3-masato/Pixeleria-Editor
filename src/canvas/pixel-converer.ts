import { decodeRLE, encodeRLE } from "$lib/rle";

type DecompressedData = {
  data: Uint32Array;
  width: number;
  height: number;
};
export class PixelConverter {
  static readonly COMPRESSER_VERSION = 1;

  /**
   * canvasの描画データを圧縮して `Uint32Array` で返すメソッド。
   * canvasのピクセルデータを取得し、RLEアルゴリズムを用いて圧縮する。
   * 圧縮されたデータには、圧縮アルゴリズムのバージョン、圧縮後のデータ長、
   * canvasの幅と高さの情報も含まれる。
   *
   * @param {CanvasRenderingContext2D} context - 圧縮するcanvasのコンテキスト。
   * @param {number} width - canvasの幅。
   * @param {number} height - canvasの高さ。
   * @returns {Uint32Array} 圧縮されたcanvasのデータ。
   */
  public static compress(
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ): Uint32Array {
    const imageData = context.getImageData(0, 0, width, height);
    const { data } = imageData;

    return this._compress(data, width, height);
  }

  /**
   * 圧縮されたデータを復元してcanvasの描画データを返すメソッド。
   * 復元されたデータには、canvasのピクセルデータ、幅、高さが含まれる。
   *
   * @param {Uint32Array} compressed - 圧縮されたcanvasのデータ。
   * @returns {DecompressedData} 復元されたcanvasのデータ、幅、高さを含むオブジェクト。
   */
  public static decompress(compressed: Uint32Array): DecompressedData {
    return this._decompress(compressed);
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
  private static _compress(
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

  /**
   * 圧縮されたデータを解凍してcanvasの描画データを返すプライベートメソッド。
   * 圧縮データの先頭から圧縮アルゴリズムのバージョンとデータ長を読み取り、
   * RLE方式で解凍する。解凍されたデータには、canvasのピクセルデータが含まれる。
   *
   * @param {Uint32Array} compressed - 圧縮されたデータ。
   * @returns {Object} 解凍されたデータ、canvasの幅、高さを含むオブジェクト。
   */
  private static _decompress(compressed: Uint32Array): DecompressedData {
    const width = compressed.at(-2)!;
    const height = compressed.at(-1)!;

    const compresserVersion = compressed[0];

    if (this.COMPRESSER_VERSION !== compresserVersion) {
      // TODO: 圧縮アルゴリズムのバージョンが異なる場合の処理を追加
    }

    const encodedArrayLength = compressed[1];
    const encodedArray = compressed.slice(2, encodedArrayLength + 2);

    const decodedArray = decodeRLE(encodedArray);

    const data = Uint32Array.from(decodedArray);

    return { data, width, height };
  }
}
