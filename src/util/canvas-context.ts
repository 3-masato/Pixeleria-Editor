/**
 * canvas要素から2Dコンテキストを取得し、そのコンテキストとキャンバス自体を含むオブジェクトを返します。
 *
 * @param canvas
 * @param contextOption
 */
export const getCanvasContext = <Canvas extends HTMLCanvasElement>(
  canvas: Canvas,
  contextOption?: CanvasRenderingContext2DSettings
): {
  canvas: Canvas;
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
