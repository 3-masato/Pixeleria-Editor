export type PixelData = {
  x: number;
  y: number;
  color: string;
};

export function getVectorDataFromCanvas(canvas: HTMLCanvasElement): PixelData[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get canvas context");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const vectorData: PixelData[] = [];

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // 透明でないピクセルのみを対象とする
      if (a !== 0) {
        const color = `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        vectorData.push({ x, y, color });
      }
    }
  }

  return vectorData;
}

export function drawOnCanvas(
  vectorData: PixelData[],
  canvas: HTMLCanvasElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get canvas context");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  vectorData.forEach((pixel) => {
    ctx.fillStyle = pixel.color;
    ctx.fillRect(pixel.x, pixel.y, 1, 1);
  });
}
