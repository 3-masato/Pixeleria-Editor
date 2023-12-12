import type { PaintMode } from "$types/shared";
import { getCanvasContext } from "../canvas-context";
import { PixelRenderer } from "../pixel-renderer";

export type DrawCanvasOption = {
  width: number;
  height: number;
  dotSize: number;
};

class PointerEventHandler {
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

  private setPixel(x: number, y: number) {
    this.pixelRenderer.set(x, y);
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
   * 座標を計算して canvas 上にドットを描画する処理。
   */
  private processDrawing(e: PointerEvent): void {
    const rect = this.target.getBoundingClientRect();
    const x = Math.trunc((e.clientX - rect.left) / this.dotSize);
    const y = Math.trunc((e.clientY - rect.top) / this.dotSize);
    console.log(x, y);

    if (this.lastX !== null && this.lastY !== null) {
      this.drawInterpolatePoints(this.lastX, this.lastY, x, y);
    }
    this.setPixel(x, y);
    this.lastX = x;
    this.lastY = y;

    this.pixelRenderer.render();
    this.renderCallback(this.pixelRenderer);
  }
}

export class DrawCanvas {
  public paintMode: PaintMode = "pen";

  public readonly width: number;
  public readonly height: number;
  public readonly dotSize: number;

  public readonly dCanvas: HTMLCanvasElement;
  public readonly dContext: CanvasRenderingContext2D;

  public readonly pCanvas: HTMLCanvasElement;
  public readonly pContext: CanvasRenderingContext2D;

  private pointerEvenetHandler: PointerEventHandler;

  constructor(
    target: HTMLCanvasElement,
    previewCanvas: HTMLCanvasElement,
    option: DrawCanvasOption
  ) {
    const { canvas: dCanvas, ctx: dContext } = getCanvasContext(target);
    this.dCanvas = dCanvas;
    this.dContext = dContext;

    const { canvas: pCanvas, ctx: pContext } = getCanvasContext(previewCanvas);
    this.pCanvas = pCanvas;
    this.pContext = pContext;

    const { width, height, dotSize } = option;
    this.width = width;
    this.height = height;
    this.dotSize = dotSize;

    this.pointerEvenetHandler = new PointerEventHandler(
      this.dCanvas,
      width,
      height,
      dotSize,
      (renderer) => {
        this.dContext.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
        this.dContext.save();
        this.dContext.drawImage(renderer.image, 0, 0);
        this.dContext.restore();
        console.log(this);
      }
    );

    this.dCanvas.width = width * dotSize;
    this.dCanvas.height = height * dotSize;

    this.dContext.scale(this.dotSize, this.dotSize);
    this.dContext.imageSmoothingEnabled = false;
  }

  set colorInt(colorInt: number) {
    this.pointerEvenetHandler.pixelRenderer.colorInt = colorInt;
  }

  clearCanvas() {
    this.pointerEvenetHandler.pixelRenderer.clear();
    this.dContext.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
  }

  getCompressedData(): Uint32Array {
    return this.pointerEvenetHandler.pixelRenderer.getCompressedData();
  }

  getImageDataURI(): string {
    return this.pointerEvenetHandler.pixelRenderer.toDataURL("image/png");
  }
}
