import { encodeRLE } from "$lib/rle";
import type { PaintMode, Vec2 } from "$types/shared";

export type PixelArtEditorOption = {
  width: number;
  height: number;
  dotSize: number;
};

export type PixelArtEventMap = {
  save: Uint32Array;
};

export class PixelCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  /** CSS color string */
  private _color: string = "#000000";

  constructor(
    canvas: HTMLCanvasElement,
    contextOption?: CanvasRenderingContext2DSettings
  ) {
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d", contextOption);
    if (ctx === null) {
      throw new Error(
        "Failed to get the 2D context. Ensure the canvas element is correctly initialized and your browser supports the 2D context."
      );
    }

    this.ctx = ctx;
  }

  set width(width: number) {
    this.canvas.width = width;
  }

  get width(): number {
    return this.canvas.width;
  }

  set height(height: number) {
    this.canvas.height = height;
  }

  get height(): number {
    return this.canvas.height;
  }

  set color(color: string) {
    this._color = color;
  }

  get color(): string {
    return this._color;
  }

  draw(x: number, y: number): void {
    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(x, y, 1, 1);
    this.ctx.restore();
  }
}

class VirtualCanvas extends PixelCanvas {
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

export class PixelArtEditor extends PixelCanvas {
  mode: PaintMode = "pen";
  artWidth: number;
  artHeight: number;
  dotSize: number;

  readonly vCanvas: VirtualCanvas;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerMove: (e: PointerEvent) => void;
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement, option: PixelArtEditorOption) {
    super(canvas);

    this.artWidth = option.width;
    this.artHeight = option.height;
    this.dotSize = option.dotSize;

    this.vCanvas = new VirtualCanvas();
    this.vCanvas.width = this.artWidth;
    this.vCanvas.height = this.artHeight;
    this.vCanvas.color = this.color;

    this.width = this.artWidth * this.dotSize;
    this.height = this.artHeight * this.dotSize;

    this.ctx.scale(this.dotSize, this.dotSize);
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  setColor(color: string) {
    this.vCanvas.color = this.color = color;
  }

  draw(x: number, y: number): void {
    super.draw(x, y);
    this.vCanvas.draw(x, y);
  }

  getRelativeCoord(x: number, y: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: Math.trunc((x - rect.left) / this.dotSize),
      y: Math.trunc((y - rect.top) / this.dotSize),
    };
  }

  getCompressedData(): Uint32Array {
    return this.vCanvas.getCompressedData();
  }

  private onPointerDown(e: PointerEvent): void {
    this.pressed = true;
    this.setPointerEventHandlers(e);
    this.processDrawing(e);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.pressed) return;
    this.processDrawing(e);
  }

  private onPointerUp(e: PointerEvent): void {
    this.pressed = false;
    this.lastX = null;
    this.lastY = null;
    this.removePointerEventHandlers(e);
  }

  /**
   * canvas にポインターイベントハンドラを設定する。
   */
  private setPointerEventHandlers(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.addEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.addEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * canvas に設定したポインターイベントハンドラを削除する。
   */
  private removePointerEventHandlers(e: PointerEvent): void {
    this.canvas.releasePointerCapture(e.pointerId);
    this.canvas.removeEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * 座標を計算して canvas 上にドットを描画する処理。
   */
  private processDrawing(e: PointerEvent): void {
    const coords = this.getRelativeCoord(e.clientX, e.clientY);
    if (this.lastX !== null && this.lastY !== null) {
      this.drawInterpolatePoints(this.lastX, this.lastY, coords.x, coords.y);
    }
    this.draw(coords.x, coords.y);
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  /**
   * ブレゼンハムの線分描画アルゴリズムを利用して2点間のドットを補間を行い描画する。
   * マウスを素早く動かしたときにドットが飛び飛びになるのを防ぐために使用。
   */
  private drawInterpolatePoints(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.draw(x0, y0);

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
}
