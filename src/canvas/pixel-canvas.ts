import { getCanvasContext } from "../util/canvas-context";

/**
 * HTMLCanvasElement でピクセル単位の描画を行うためのクラス。
 */
export class PixelCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  /**
   * PixelCanvas のインスタンスを生成します。
   * @param target - 描画対象の HTMLCanvasElement。
   * @param width - キャンバスの幅（ピクセル単位）。
   * @param height - キャンバスの高さ（ピクセル単位）。
   * @param dotSize - 1ピクセルあたりのサイズ（拡大率）。
   * @param contextOption - キャンバスの2Dコンテキスト設定。
   */
  constructor(
    target: HTMLCanvasElement,
    readonly width: number,
    readonly height: number,
    readonly dotSize: number = 1,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    const { canvas, ctx } = getCanvasContext(target, contextOption);
    this.canvas = canvas;
    this.ctx = ctx;

    this.resize(width, height, dotSize);
  }

  /**
   * キャンバスのサイズを変更します。
   * @param width - 新しい幅（ピクセル単位）。
   * @param height - 新しい高さ（ピクセル単位）。
   * @param dotSize - 1ピクセルあたりの新しいサイズ（拡大率）。
   */
  resize(width: number, height: number, dotSize: number) {
    this.canvas.width = width * dotSize;
    this.canvas.height = height * dotSize;
    this.ctx.scale(dotSize, dotSize);
  }

  /**
   * キャンバスに画像を描画します。
   * @param image - 描画する画像
   */
  draw(image: CanvasImageSource): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    this.ctx.drawImage(image, 0, 0);
    this.ctx.restore();
  }

  /**
   * キャンバスをクリアします。
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
