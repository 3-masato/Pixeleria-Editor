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
  import type { NumericArray } from "$types/shared";

  import { rgbToInt } from "$lib/color";
  import chroma from "chroma-js";
  import { onMount } from "svelte";
  // Component
  import Button from "./component/button.svelte";
  import Canvas from "./component/canvas.svelte";
  // Icon
  import ArrowRotateLeft from "./icon/arrow-rotate-left.svg.svelte";
  import ArrowRotateRight from "./icon/arrow-rotate-right.svg.svelte";
  import BorderNone from "./icon/border-none.svg.svelte";
  import TrashCan from "./icon/trash-can.svg.svelte";
  // Interaction
  import ColorPicker from "./editor/color-picker.svelte";
  import { tryLoadData } from "./editor/editor";
  import { paintTools } from "./editor/tools";
  import { Editor, type PixelArtEventMap } from "./interaction/editor";
  import { History } from "./interaction/history";
  import type { InteractiveRendererEventMap } from "./internal/interactive-renderer";
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

  let colorPicker: HTMLInputElement;

  let clientWidth: number;
  let clientHeight: number;
  let visibleGrid: boolean;

  const history = new History<string>();
  let canUndo: boolean;
  let canRedo: boolean;
  const updateHistory = () => {
    canUndo = history.canUndo();
    canRedo = history.canRedo();
  };
  const restoreFromState = (historyState: string) => {
    editor.setPixelData(Uint32Array.from(historyState.split(",").map(Number)));
    updateHistory();
  };
  const setHistory = (pixelData: Uint32Array) => {
    history.push(pixelData.join(","));
    updateHistory();
  };
  const onUndo = () => {
    if (!canUndo) {
      return;
    }

    const historyState = history.undo();
    if (historyState) {
      restoreFromState(historyState);
    }
  };
  const onRedo = () => {
    if (!canRedo) {
      return;
    }

    const historyState = history.redo();
    if (historyState) {
      restoreFromState(historyState);
    }
  };
  const pushState = (
    e: InteractiveRendererEventMap["clear"] | InteractiveRendererEventMap["pointerdown"]
  ) => {
    setHistory(e.pixelData);
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

    editor.on("pointerup", pushState);
    editor.on("clear", pushState);
    setHistory(editor.getPixelData().pixelData);
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
      {#each paintTools as tool}
        <Button
          on:click={() => {
            editor.paintMode = tool.mode;
          }}
          class={editor?.paintMode === tool.mode
            ? "bg-slate-50 fill-slate-950 outline-sky-500"
            : ""}
        >
          <svelte:component this={tool.icon} width="24" height="24" />
        </Button>
      {/each}
    </div>
    <div class="flex flex-wrap gap-4" id="colors">
      <ColorPicker on:pick={onPick} />
    </div>
    <div class="flex flex-wrap gap-4" id="histories">
      <Button on:click={onUndo} disabled={!canUndo}>
        <ArrowRotateLeft width="24" height="24" />
      </Button>
      <Button on:click={onRedo} disabled={!canRedo}>
        <ArrowRotateRight width="24" height="24" />
      </Button>
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
