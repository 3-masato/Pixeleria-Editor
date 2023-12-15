import type { PaintMode, Vec2 } from "$types/shared";
import { getCanvasContext } from "./canvas-context";
import { HoverCanvas } from "./hover-canvas";
import { PixelCanvas } from "./pixel-canvas";
import { PixelRenderer } from "./pixel-renderer";

export class InteractiveRenderer {
  public paintMode: PaintMode = "pen";
  public colorInt: number = 0;

  public readonly pixelRenderer: PixelRenderer;

  public readonly targetCanvas: HTMLCanvasElement;
  public readonly targetContext: CanvasRenderingContext2D;

  public readonly backgroundCanvas: PixelCanvas;
  public readonly gridCanvas: PixelCanvas;
  public readonly drawCanvas: PixelCanvas;
  public readonly hoverCanvas: HoverCanvas;

  private pressed = false;

  // 最後に記録されたマウスのX座標とY座標。
  private lastX: number | null = null;
  private lastY: number | null = null;

  // イベントリスナーへの参照を保持するために使用する。
  private readonly boundOnPointerUp: (e: PointerEvent) => void;

  constructor(
    target: HTMLCanvasElement,
    public readonly width: number,
    public readonly height: number,
    public readonly dotSize: number,
    public readonly renderCallback: (renderer: PixelRenderer) => void
  ) {
    const { canvas, ctx } = getCanvasContext(target);
    this.targetCanvas = canvas;
    this.targetContext = ctx;

    this.pixelRenderer = new PixelRenderer(width, height);

    this.targetCanvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    this.targetCanvas.addEventListener("pointermove", (e) => this.onPointerMove(e));

    this.boundOnPointerUp = this.onPointerUp.bind(this);

    this.backgroundCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.gridCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.drawCanvas = new PixelCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
    this.hoverCanvas = new HoverCanvas(
      document.createElement("canvas"),
      width,
      height,
      1
    );
  }

  get rgbaInt() {
    const alpha = (0xff << 24) >>> 0;
    const rgbaInt = this.paintMode === "erase" ? 0 : this.colorInt | alpha;

    return rgbaInt;
  }

  public clear() {
    this.pixelRenderer.clear();
    this.backgroundCanvas.clear();
    this.gridCanvas.clear();
    this.drawCanvas.clear();
    this.hoverCanvas.clear();
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
    const { x, y } = this.calcPixelPosition(e);
    this.hoverCanvas.drawPixel(x, y, this.rgbaInt);

    if (this.pressed) {
      this.processDrawing(x, y);
    }

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
    this.targetCanvas.setPointerCapture(e.pointerId);
    this.targetCanvas.addEventListener("pointerup", this.boundOnPointerUp);
  }

  /**
   * canvas に設定したポインターイベントハンドラを削除する。
   */
  private removePointerEventHandlers(e: PointerEvent): void {
    this.targetCanvas.releasePointerCapture(e.pointerId);
    this.targetCanvas.removeEventListener("pointerup", this.boundOnPointerUp);
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
    const rect = this.targetCanvas.getBoundingClientRect();
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
    const image = this.pixelRenderer.image;

    this.drawCanvas.draw(image);

    this.targetContext.clearRect(0, 0, this.width, this.height);
    this.targetContext.drawImage(this.backgroundCanvas.canvas, 0, 0);
    this.targetContext.drawImage(this.gridCanvas.canvas, 0, 0);
    this.targetContext.drawImage(this.drawCanvas.canvas, 0, 0);
    this.targetContext.drawImage(this.hoverCanvas.canvas, 0, 0);

    this.renderCallback(this.pixelRenderer);
  }
}
