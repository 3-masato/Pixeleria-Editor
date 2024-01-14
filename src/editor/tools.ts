import type { PaintMode } from "$types/shared";
import Eraser from "../icon/eraser.svg.svelte";
import FillDrip from "../icon/fill-drip.svg.svelte";
import Pen from "../icon/pen.svg.svelte";

type PaintTools = Array<{
  id: string;
  mode: PaintMode;
  icon: any;
}>;
export const paintTools: PaintTools = [
  {
    id: "pencil",
    mode: "pen",
    icon: Pen
  },
  {
    id: "eraser",
    mode: "erase",
    icon: Eraser
  },
  {
    id: "fill",
    mode: "fill",
    icon: FillDrip
  }
];
