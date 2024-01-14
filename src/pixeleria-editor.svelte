<!-- 
  Get the current component without using the non-public `get_current_component` function.
  See: https://github.com/sveltejs/svelte/issues/9189#issuecomment-1794764745
-->
<svelte:options
  customElement={{
    tag: "pixeleria-editor",
    // @ts-ignore
    extend: (customElementConstructor) => {
      return class extends customElementConstructor {
        constructor() {
          super();
          this.component = this;
        }
      };
    }
  }}
/>

<script lang="ts">
  import type { NumericArray, PaintMode } from "$types/shared";

  import { rgbToInt } from "$lib/color";
  import chroma from "chroma-js";
  import { onMount } from "svelte";
  // Component
  import Button from "./component/button.svelte";
  import Canvas from "./component/canvas.svelte";
  // Icon
  import BorderNone from "./icon/border-none.svg.svelte";
  import TrashCan from "./icon/trash-can.svg.svelte";
  // Interaction
  import ColorPicker from "./editor/color-picker.svelte";
  import { tryLoadData } from "./editor/editor";
  import HistoryTool from "./editor/history-tool.svelte";
  import PaintTools from "./editor/paint-tools.svelte";

  import { Editor, type PixelArtEventMap } from "./interaction/editor";
  import { PixelConverter } from "./internal/pixel-converer";
  import { createCustomEventDispatcher } from "./util/custom-event";

  export let component: HTMLElement;

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;

  export const getDetails = () => {
    const { pixelData, width, height } = editor.getPixelData();
    return {
      pixelData: PixelConverter.compress(pixelData, width, height),
      imageData: editor.getImageDataURI()
    };
  };
  export const loadPixelData = (pixelDataLike: NumericArray) => {
    if (!tryLoadData(editor, pixelDataLike, artWidth, artHeight)) {
      alert("Invalid data.");
    }
  };

  let editor: Editor;

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onClear = () => {
    editor.clearCanvas();
    dispatch("clear");
  };

  let canvasArea: HTMLElement;
  let backgroundCanvas: HTMLCanvasElement;
  let drawCanvas: HTMLCanvasElement;
  let hoverCanvas: HTMLCanvasElement;
  let gridCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;

  let clientWidth: number;
  let clientHeight: number;

  let visibleGrid: boolean;

  let paintTools: PaintMode;
  const onChangeTool = (e: CustomEvent<PaintMode>) => {
    editor.paintMode = e.detail;
  };

  let historyTool: HistoryTool;
  const onRestoreState = (e: CustomEvent<Uint32Array>) => {
    editor.setPixelData(e.detail);
  };

  onMount(() => {
    editor = new Editor({
      canvasArea,
      backgroundCanvas,
      drawCanvas,
      hoverCanvas,
      gridCanvas,
      previewCanvas,
      width: Number(artWidth),
      height: Number(artHeight),
      dotSize
    });

    clientWidth = editor.clientWidth;
    clientHeight = editor.clientHeight;

    visibleGrid = editor.visibleGrid;

    paintTools = editor.paintMode;

    editor.on("pointerup", historyTool.pushState);
    editor.on("clear", historyTool.pushState);
    historyTool.init(editor.getPixelData().pixelData);
  });

  const onPick = (e: CustomEvent<string>) => {
    const pickedColor = e.detail;
    const chromaColor = chroma(pickedColor);
    const rgb = chromaColor.rgb();
    const colorInt = rgbToInt(rgb[2], rgb[1], rgb[0]);
    editor.colorInt = colorInt;
  };
</script>

<div class="flex justify-evenly" style="--width: {clientWidth}px; --height: {clientHeight}px;">
  <div class="relative h-[var(--height)] w-[var(--width)]" id="canvas-area" bind:this={canvasArea}>
    <Canvas id="background-canvas" bind:ref={backgroundCanvas} class="absolute" />
    <Canvas id="draw-canvas" bind:ref={drawCanvas} class="absolute" />
    <Canvas id="hover-canvas" bind:ref={hoverCanvas} class="absolute" />
    <Canvas id="grid-canvas" bind:ref={gridCanvas} class="absolute" />
  </div>
  <div class="w-64 space-y-4">
    <div class="flex flex-wrap justify-center gap-4" id="previews">
      <Canvas id="preview-canvas" bind:ref={previewCanvas} />
    </div>
    <div class="flex flex-wrap gap-4" id="paint-modes">
      <PaintTools bind:currentMode={paintTools} on:change={onChangeTool} />
    </div>
    <div class="flex flex-wrap gap-4" id="colors">
      <ColorPicker on:pick={onPick} />
    </div>
    <div class="flex flex-wrap gap-4" id="histories">
      <HistoryTool bind:this={historyTool} on:restoreState={onRestoreState} />
    </div>
    <div class="flex flex-wrap gap-4" id="actions">
      <Button
        class={visibleGrid ? "bg-slate-900 fill-slate-50" : ""}
        on:click={() => {
          visibleGrid = editor.toggleVisibleGrid();
        }}
      >
        <BorderNone width="24" height="24" />
      </Button>
      <Button
        class="border border-red-900 bg-red-100 fill-red-800 hover:bg-red-800 hover:fill-red-100"
        on:click={onClear}
      >
        <TrashCan width="24" height="24" />
      </Button>
    </div>
  </div>
</div>

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "./app.postcss";

  :global(svg:focus) {
    @apply outline-none;
  }

  :host {
    @apply block w-full max-w-[1920px];
  }
</style>
