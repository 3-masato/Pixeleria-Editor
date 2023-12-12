/**
 * ピクセルバッファを表すクラス
 */
export class PixelBuffer {
  /** ピクセルバッファの幅 */
  readonly width: number;

  /** ピクセルバッファの高さ */
  readonly height: number;

  /** ピクセルデータを格納するバッファ */
  readonly pixelData: Uint32Array;

  /**
   * Pixel インスタンスを作成します。
   *
   * @param {number} width - ピクセルバッファの幅
   * @param {number} height - ピクセルバッファの高さ
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixelData = new Uint32Array(width * height);
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
    this.pixelData[y * this.width + x] = color;
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
    return this.pixelData[y * this.width + x];
  }

  /**
   * 指定された座標がバッファの範囲内にあるかどうかを確認します。
   *
   * @param {number} x - 確認するx座標
   * @param {number} y - 確認するy座標
   * @returns {boolean} 座標が範囲内の場合は `true`、そうでない場合は `false`
   */
  contain(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /**
   * ピクセルバッファの全てのピクセルをクリア（リセット）します。
   *
   * @returns {void}
   */
  clear(): void {
    this.pixelData.fill(0);
  }
}
