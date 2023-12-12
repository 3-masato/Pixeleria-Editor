export const getCanvasContext = (
  canvas: HTMLCanvasElement,
  contextOption?: CanvasRenderingContext2DSettings
): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} => {
  const ctx = canvas.getContext("2d", contextOption);
  if (ctx === null) {
    throw new Error(
      "Failed to get the 2D context. Ensure the canvas element is correctly initialized and your browser supports the 2D context."
    );
  }

  return { canvas, ctx };
};
