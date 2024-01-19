import type { NumericArray } from "$types/shared";
import type { Editor } from "../interaction/editor";
import { PixelConverter } from "../internal/pixel-converer";

export const tryLoadData = (
  editor: Editor,
  pixelDataLike: NumericArray,
  artWidth: number,
  artHeight: number
) => {
  const pixelData = Uint32Array.from(pixelDataLike);
  const { data, width, height } = PixelConverter.decompress(pixelData);

  if (width !== Number(artWidth) || height !== Number(artHeight)) {
    return false;
  }

  return editor.setPixelData(data);
};
