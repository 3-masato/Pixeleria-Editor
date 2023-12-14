import type { PaintMode, Vec2 } from "$types/shared";
import { PixelRenderer } from "./pixel-renderer";

export class InteractiveRenderer {
  public paintMode: PaintMode = "pen";
  public colorInt: number = 0;

  public readonly pixelRenderer: PixelRenderer;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerMove: (e: PointerEvent) => void;
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(
    public readonly target: HTMLCanvasElement,
    public readonly width: number,
    public readonly height: number,
    public readonly dotSize: number,
    public readonly renderCallback: (renderer: PixelRenderer) => void
  ) {
    this.pixelRenderer = new PixelRenderer(width, height);

    this.target.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  get rgbaInt() {
    const alpha = (0xff << 24) >>> 0;
    const rgbaInt = this.paintMode === "erase" ? 0 : this.colorInt | alpha;

    return rgbaInt;
  }

  private setPixel(x: number, y: number): void {
    this.pixelRenderer.set(x, y, this.rgbaInt);
  }

  private onPointerDown(e: PointerEvent): void {
    this.setPointerEventHandlers(e);

    const { x, y } = this.calcPixelPosition(e);
    if (this.paintMode === "fill") {
      this.pixelRenderer.floodFill(x, y, this.rgbaInt);
    } else {
      this.pressed = true;
      this.processDrawing(x, y);
    }

    this.render();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.pressed) return;

    const { x, y } = this.calcPixelPosition(e);
    this.processDrawing(x, y);
    this.render();
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
    this.target.setPointerCapture(e.pointerId);
    this.target.addEventListener("pointermove", this.boundOnPointerMove);
    this.target.addEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * canvas に設定したポインターイベントハンドラを削除する。
   */
  private removePointerEventHandlers(e: PointerEvent): void {
    this.target.releasePointerCapture(e.pointerId);
    this.target.removeEventListener("pointermove", this.boundOnPointerMove);
    this.target.removeEventListener("pointerup", this.boundOnPointerUp);
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
   * `PointerEvent` オブジェクトを受け取り、
   * イベント発生地点の位置からキャンバス上の対応するピクセル座標を取得する。
   *
   * @param {PointerEvent} e ユーザーからの `PointerEvent` オブジェクト
   * @returns {Vec2} キャンバス上のピクセル位置
   */
  private calcPixelPosition(e: PointerEvent): Vec2 {
    const rect = this.target.getBoundingClientRect();
    const x = Math.trunc((e.clientX - rect.left) / this.dotSize);
    const y = Math.trunc((e.clientY - rect.top) / this.dotSize);

    return { x, y };
  }

  /**
   * 座標を計算して canvas 上にドットを描画する処理。
   */
  private processDrawing(x: number, y: number): void {
    if (this.lastX !== null && this.lastY !== null) {
      this.drawInterpolatePoints(this.lastX, this.lastY, x, y);
    }
    this.setPixel(x, y);
    this.lastX = x;
    this.lastY = y;
  }

  private render(): void {
    this.pixelRenderer.render();
    this.renderCallback(this.pixelRenderer);
  }
}
