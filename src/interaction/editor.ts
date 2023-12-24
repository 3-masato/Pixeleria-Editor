import type { PaintMode } from "$types/shared";
import { BackgroundCanvas } from "../canvas/background-canvas";
import { DrawCanvas } from "../canvas/draw-canvas";
import { GridCanvas } from "../canvas/grid-canvas";
import { HoverCanvas } from "../canvas/hover-canvas";
import { PreviewCanvas } from "../canvas/preview-canvas";
import { InteractiveRenderer } from "../internal/interactive-renderer";
import type { PixelRenderer } from "../internal/pixel-renderer";

export type PixelArtEventMap = {
  save: {
    pixelData: Uint32Array;
    imageData: string;
  };
  clear: void;
};

export type EditorOption = {
  canvasArea: HTMLElement;
  backgroundCanvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  hoverCanvas: HTMLCanvasElement;
  gridCanvas: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  dotSize: number;
};

export class Editor {
  public readonly width: number;
  public readonly height: number;

  public readonly clientWidth: number;
  public readonly clientHeight: number;

  private readonly backgroundCanvas: BackgroundCanvas;
  private readonly drawCanvas: DrawCanvas;
  private readonly hoverCanvas: HoverCanvas;
  private readonly gridCanvas: GridCanvas;
  private readonly previewCanvas: PreviewCanvas;

  private readonly interactiveRenderer: InteractiveRenderer;
  private readonly pixelRenderer: PixelRenderer;

  constructor(option: EditorOption) {
    const {
      canvasArea,
      backgroundCanvas,
      drawCanvas,
      hoverCanvas,
      gridCanvas,
      previewCanvas,
      width,
      height,
      dotSize,
    } = option;
    this.width = width;
    this.height = height;
    this.clientWidth = width * dotSize;
    this.clientHeight = height * dotSize;

    this.previewCanvas = new PreviewCanvas(
      previewCanvas,
      width,
      height,
      dotSize / 4
    );

    this.backgroundCanvas = new BackgroundCanvas(
      backgroundCanvas,
      width * 2,
      height * 2,
      dotSize / 2
    );
    this.drawCanvas = new DrawCanvas(drawCanvas, width, height, dotSize);
    this.hoverCanvas = new HoverCanvas(hoverCanvas, width, height, dotSize);
    this.gridCanvas = new GridCanvas(
      gridCanvas,
      this.clientWidth,
      this.clientHeight
    );

    this.interactiveRenderer = new InteractiveRenderer(
      canvasArea,
      width,
      height,
      dotSize
    );

    this.pixelRenderer = this.interactiveRenderer.pixelRenderer;

    this.gridCanvas.drawGrid(dotSize);
    this.backgroundCanvas.drawBackground();

    this.interactiveRenderer
      .on("pointermove", ({ x, y, rgbaInt }) => {
        this.hoverCanvas.drawPixel(x, y, rgbaInt);
      })
      .on("render", () => {
        const imageSource = this.interactiveRenderer.pixelRenderer.image;
        this.drawCanvas.draw(imageSource);
        this.previewCanvas.draw(imageSource);
      })
      .on("clear", () => {
        this.drawCanvas.clear();
      });
  }

  set paintMode(paintMode: PaintMode) {
    this.interactiveRenderer.paintMode = paintMode;
  }

  get paintMode() {
    return this.interactiveRenderer.paintMode;
  }

  set colorInt(colorInt: number) {
    this.interactiveRenderer.colorInt = colorInt;
  }

  get colorInt() {
    return this.interactiveRenderer.colorInt;
  }

  get visibleGrid() {
    return this.gridCanvas.visibility;
  }

  clearCanvas() {
    const confirmResult = window.confirm("Clear the canvas?");
    if (!confirmResult) return;

    this.interactiveRenderer.clear();
  }

  getImageDataURI(): string {
    return this.pixelRenderer.toDataURL("image/png");
  }

  loadPixelData(data: Uint32Array): boolean {
    const requiredLength = this.width * this.height * 4;
    if (data.buffer.byteLength !== requiredLength) {
      return false;
    }

    this.interactiveRenderer.setPixelData(data);
    return true;
  }

  getPixelData(): {
    pixelData: Uint32Array;
    width: number;
    height: number;
  } {
    return {
      pixelData: this.pixelRenderer.pixelData,
      width: this.width,
      height: this.height,
    };
  }

  toggleVisibleGrid() {
    return this.gridCanvas.toggleVisibility();
  }
}
