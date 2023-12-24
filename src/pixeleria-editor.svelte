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
  import Button from "./component/button.svelte";
  import Canvas from "./component/canvas.svelte";
  import BorderNone from "./icon/border-none.svg.svelte";
  import Eraser from "./icon/eraser.svg.svelte";
  import FillDrip from "./icon/fill-drip.svg.svelte";
  import Minus from "./icon/minus.svg.svelte";
  import Pen from "./icon/pen.svg.svelte";
  import Pencil from "./icon/pencil.svg.svelte";
  import Plus from "./icon/plus.svg.svelte";
  import TrashCan from "./icon/trash-can.svg.svelte";
  import { ColorPallet } from "./interaction/color-pallet";
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
    if (!tryLoadData(pixelDataLike)) {
      alert("Invalid data.");
    }
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

  const colorPallet = new ColorPallet();
  let currentPallet = colorPallet.toArray();
  let editor: Editor;
  let colorValue: string = "#000000";
  let pickedColor: string = colorValue;

  const tryLoadData = (pixelDataLike: NumericArray) => {
    const pixelData = Uint32Array.from(pixelDataLike);
    const { data, width, height } = PixelConverter.decompress(pixelData);

    if (width !== Number(artWidth) || height !== Number(artHeight)) {
      return false;
    }

    return editor.loadPixelData(data);
  };

  const updatePallet = () => {
    currentPallet = colorPallet.toArray().reverse();
  };

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onClear = () => {
    editor.clearCanvas();
    dispatch("clear");
  };

  type PaintTools = Array<{
    id: string;
    mode: PaintMode;
    icon: any;
  }>;
  const paintTools: PaintTools = [
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
    updatePallet();
  });

  $: if (editor) {
    const chromaColor = chroma(pickedColor);
    const rgb = chromaColor.rgb();
    const colorInt = rgbToInt(rgb[2], rgb[1], rgb[0]);
    editor.colorInt = colorInt;
  }
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
      <Button tag="label">
        <Plus width="24" height="24" />
        <input
          class="visually-hidden"
          type="color"
          bind:value={colorValue}
          on:change={() => {
            pickedColor = colorValue;
            colorPallet.push(pickedColor);
            updatePallet();
          }}
        />
      </Button>
      {#each currentPallet as color}
        <div class="group relative" style="--palletColor: {color}">
          <Button
            class={`bg-[var(--palletColor)] ${pickedColor === color ? "outline-sky-500" : ""}`}
            on:click={() => {
              pickedColor = color;
            }}
          >
            <Pencil width="24" height="24" stroke="white" stroke-width="20" />
          </Button>
          {#if currentPallet.length > 1}
            <button
              class="absolute left-0 top-0 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-slate-100 fill-slate-950 p-0 opacity-0 shadow-lg transition-all duration-75 ease-out hover:bg-slate-50 active:bg-slate-300 group-hover:opacity-100"
              on:click={() => {
                colorPallet.remove(color);
                updatePallet();
                pickedColor = colorPallet.currentColor;
              }}
            >
              <Minus width="8" height="8" />
            </button>
          {/if}
        </div>
      {/each}
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

  .visually-hidden {
    @apply !absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0;
    clip: rect(0, 0, 0, 0) !important;
  }
</style>
