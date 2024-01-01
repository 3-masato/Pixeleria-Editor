import type { PaintMode, Vec2 } from "$types/shared";
import { EventDispatcher } from "../util/event";
import { PixelRenderer } from "./pixel-renderer";

interface InteractiveRendererPointerEvent {
  x: number;
  y: number;
  rgbaInt: number;
  pixelData: Uint32Array;
}

interface InteractiveRendererRenderEvent {
  pixelData: Uint32Array;
}

type InteractiveRendererEventMap = {
  pointerdown: InteractiveRendererPointerEvent;
  pointermove: InteractiveRendererPointerEvent;
  pointerup: InteractiveRendererPointerEvent;
  render: InteractiveRendererRenderEvent;
  clear: InteractiveRendererRenderEvent;
};

export class InteractiveRenderer extends EventDispatcher<InteractiveRendererEventMap> {
  public paintMode: PaintMode = "pen";
  public colorInt: number = 0;

  public readonly pixelRenderer: PixelRenderer;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(
    public readonly target: HTMLElement,
    public readonly width: number,
    public readonly height: number,
    public readonly dotSize: number
  ) {
    super();

    target.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    target.addEventListener("pointermove", (e) => this.onPointerMove(e));

    this.boundOnPointerUp = this.onPointerUp.bind(this);

    this.pixelRenderer = new PixelRenderer(width, height);
  }

  get rgbaInt() {
    const alpha = (0xff << 24) >>> 0;
    const rgbaInt = this.paintMode === "erase" ? 0 : this.colorInt | alpha;

    return rgbaInt;
  }

  public clear() {
    this.pixelRenderer.clear();
    this.fire("clear", {
      pixelData: this.pixelRenderer.pixelData
    });
  }

  private setPixel(x: number, y: number): void {
    this.pixelRenderer.set(x, y, this.rgbaInt);
  }

  private onPointerDown(e: PointerEvent): void {
    const { x, y } = this.calcPixelPosition(e);

    this.setPointerEventHandlers(e);

    if (this.paintMode === "fill") {
      this.pixelRenderer.floodFill(x, y, this.rgbaInt);
    } else {
      this.pressed = true;
      this.processDrawing(x, y);
    }

    this.render();

    this.fire("pointerdown", {
      x,
      y,
      rgbaInt: this.rgbaInt,
      pixelData: this.pixelRenderer.pixelData
    });
  }

  private onPointerMove(e: PointerEvent): void {
    const { x, y } = this.calcPixelPosition(e);

    if (this.pressed) {
      this.processDrawing(x, y);
      this.render();
    }

    this.fire("pointermove", {
      x,
      y,
      rgbaInt: this.rgbaInt,
      pixelData: this.pixelRenderer.pixelData
    });
  }

  private onPointerUp(e: PointerEvent): void {
    const { x, y } = this.calcPixelPosition(e);

    this.removePointerEventHandlers(e);

    this.pressed = false;
    this.lastX = null;
    this.lastY = null;

    this.fire("pointerup", {
      x,
      y,
      rgbaInt: this.rgbaInt,
      pixelData: this.pixelRenderer.pixelData
    });
  }

  /**
   * canvas にポインターイベントハンドラを設定する。
   */
  private setPointerEventHandlers(e: PointerEvent): void {
    this.target.setPointerCapture(e.pointerId);
    this.target.addEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * canvas に設定したポインターイベントハンドラを削除する。
   */
  private removePointerEventHandlers(e: PointerEvent): void {
    this.target.releasePointerCapture(e.pointerId);
    this.target.removeEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * ブレゼンハムの線分描画アルゴリズムを利用して2点間のドットを補間を行い描画する。
   * マウスを素早く動かしたときにドットが飛び飛びになるのを防ぐために使用。
   */
  private drawInterpolatePoints(x0: number, y0: number, x1: number, y1: number): void {
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
    const dotSize = this.dotSize;
    const x = Math.trunc((e.clientX - rect.left) / dotSize);
    const y = Math.trunc((e.clientY - rect.top) / dotSize);

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
    this.fire("render", {
      pixelData: this.pixelRenderer.pixelData
    });
  }
}
