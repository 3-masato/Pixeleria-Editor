import type { PaintMode, Vec2 } from "$types/shared";
import { getCanvasContext } from "../canvas-context";
import { PixelRenderer } from "../pixel-renderer";

export type DrawCanvasOption = {
  width: number;
  height: number;
  dotSize: number;
};

export class DrawCanvas {
  public paintMode: PaintMode = "pen";

  public readonly width: number;
  public readonly height: number;
  public readonly dotSize: number;

  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;

  public readonly pixelRenderer: PixelRenderer;

  protected colorInt: number = 0;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerMove: (e: PointerEvent) => void;
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(
    target: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    const { canvas, ctx } = getCanvasContext(target);
    this.canvas = canvas;
    this.ctx = ctx;

    const { width, height, dotSize } = option;
    this.width = width;
    this.height = height;
    this.dotSize = dotSize;
    this.canvasWidth = width * dotSize;
    this.canvasHeight = height * dotSize;

    this.ctx.scale(this.dotSize, this.dotSize);
    this.ctx.imageSmoothingEnabled = false;

    this.pixelRenderer = new PixelRenderer(width, height);
    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  set canvasWidth(width: number) {
    this.canvas.width = width;
  }

  get canvasWidth(): number {
    return this.canvas.width;
  }

  set canvasHeight(height: number) {
    this.canvas.height = height;
  }

  get canvasHeight(): number {
    return this.canvas.height;
  }

  private setPixel(x: number, y: number): void {
    this.pixelRenderer.set(x, y, this.colorInt | 0xff000000);
  }

  private getRelativeCoord(x: number, y: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: Math.trunc((x - rect.left) / this.dotSize),
      y: Math.trunc((y - rect.top) / this.dotSize),
    };
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
      this.setPixel(x0, y0);

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

  /**
   * 座標を計算して canvas 上にドットを描画する処理。
   */
  private processDrawing(e: PointerEvent): void {
    const coords = this.getRelativeCoord(e.clientX, e.clientY);
    if (this.lastX !== null && this.lastY !== null) {
      this.drawInterpolatePoints(this.lastX, this.lastY, coords.x, coords.y);
    }
    this.setPixel(coords.x, coords.y);
    this.lastX = coords.x;
    this.lastY = coords.y;

    this.pixelRenderer.render();

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.save();
    this.ctx.drawImage(this.pixelRenderer.vCanvas, 0, 0);
    this.ctx.restore();
  }

  clearCanvas() {
    this.pixelRenderer.clear();
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  getCompressedData(): Uint32Array {
    return this.pixelRenderer.getCompressedData();
  }

  getImageDataURI(): string {
    return this.pixelRenderer.toDataURL("image/png");
  }
}
