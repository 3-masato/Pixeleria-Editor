import type { PaintMode, Vec2 } from "./type";

export type PixelArtEditorOption = {
  width: number;
  height: number;
  dotSize: number;
};
export class PixelArtEditor {
  mode: PaintMode = "pen";
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dotSize: number;
  color: string = "#000000";

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnPointerUp: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement, option: PixelArtEditorOption) {
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) {
      throw new Error(
        "Failed to get the 2D context. Ensure the canvas element is correctly initialized and your browser supports the 2D context."
      );
    }

    this.ctx = ctx;
    this.width = option.width;
    this.height = option.height;
    this.dotSize = option.dotSize;

    this.canvas.width = this.width * this.dotSize;
    this.canvas.height = this.height * this.dotSize;

    this.ctx.scale(this.dotSize, this.dotSize);
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  setColor(color: string) {
    this.color = color;
  }

  draw(x: number, y: number) {
    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(x, y, 1, 1);
    this.ctx.restore();
  }

  getRelativeCoord(x: number, y: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: Math.trunc((x - rect.left) / this.dotSize),
      y: Math.trunc((y - rect.top) / this.dotSize),
    };
  }

  private onPointerDown(e: PointerEvent) {
    this.pressed = true;
    this.setPointerEventHandlers(e);
    this.processDrawing(e);
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.pressed) return;
    this.processDrawing(e);
  }

  private onPointerUp(e: PointerEvent) {
    this.pressed = false;
    this.lastX = null;
    this.lastY = null;
    this.removePointerEventHandlers(e);
  }

  /**
   * canvas にポインターイベントハンドラを設定する。
   */
  private setPointerEventHandlers(e: PointerEvent) {
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.addEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.addEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * canvas に設定したポインターイベントハンドラを削除する。
   */
  private removePointerEventHandlers(e: PointerEvent) {
    this.canvas.releasePointerCapture(e.pointerId);
    this.canvas.removeEventListener("pointermove", this.boundOnPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * 座標を計算してcanvas上にドットを描画する処理。
   */
  private processDrawing(e: PointerEvent) {
    const coords = this.getRelativeCoord(e.clientX, e.clientY);
    if (this.lastX !== null && this.lastY !== null) {
      this.interpolatePoints(this.lastX, this.lastY, coords.x, coords.y);
    }
    this.draw(coords.x, coords.y);
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  /**
   * ブレゼンハムの線分描画アルゴリズムを利用して2点間のドットを補間を行う。
   * マウスを素早く動かしたときにドットが飛び飛びになるのを防ぐために使用。
   */
  private interpolatePoints(x0: number, y0: number, x1: number, y1: number) {
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
