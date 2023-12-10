import type { PaintMode, Vec2 } from "$types/shared";
import { PixelCanvas } from "./pixel-canvas";

export type DrawCanvasOption = {
  width: number;
  height: number;
  dotSize: number;
};

export class DrawCanvas extends PixelCanvas {
  paintMode: PaintMode = "pen";

  readonly artWidth: number;
  readonly artHeight: number;
  readonly dotSize: number;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerMove: (e: PointerEvent) => void;
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement, option: DrawCanvasOption) {
    super(canvas);

    this.artWidth = option.width;
    this.artHeight = option.height;
    this.dotSize = option.dotSize;

    this.size(this.artWidth * this.dotSize, this.artHeight * this.dotSize);

    this.ctx.scale(this.dotSize, this.dotSize);
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  private pointerAction(x: number, y: number): void {
    switch (this.paintMode) {
      case "pen": {
        this.draw(x, y);
        break;
      }

      case "erase": {
        this.erase(x, y);
        break;
      }
    }
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
   * 座標を計算して canvas 上にドットを描画する処理。
   */
  private processDrawing(e: PointerEvent): void {
    const coords = this.getRelativeCoord(e.clientX, e.clientY);
    if (this.lastX !== null && this.lastY !== null) {
      this.drawInterpolatePoints(this.lastX, this.lastY, coords.x, coords.y);
    }
    this.pointerAction(coords.x, coords.y);
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
      this.pointerAction(x0, y0);

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
