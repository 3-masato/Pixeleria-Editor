<!-- Get the current component without using the non-public `get_current_component` function. -->
<!-- See: https://github.com/sveltejs/svelte/issues/9189#issuecomment-1794764745 -->
<svelte:options customElement={{
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
}} />


<script lang="ts">
  import { rgbToInt } from "$lib/color";
  import type { NumericArray, PaintMode } from "$types/shared";
  import chroma from "chroma-js";
  import { onMount } from "svelte";
  import BorderNone from "./icon/border-none.svg.svelte";
  import Eraser from "./icon/eraser.svg.svelte";
  import FillDrip from "./icon/fill-drip.svg.svelte";
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
    }
  };
  export const loadPixelData = (pixelDataLike: NumericArray) => {
    if (!tryLoadData(pixelDataLike)) {
      alert("Invalid data.");
    }
  };

  const tryLoadData = (pixelDataLike: NumericArray) => {
    const pixelData = Uint32Array.from(pixelDataLike);
    const { data, width, height } = PixelConverter.decompress(pixelData);

    if (width !== Number(artWidth) || height !== Number(artHeight)) {
      return false;
    }

    return editor.loadPixelData(data);
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
  let pickedColor: string = "#000000";
  let colorValue: string = "#000000";

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onClear = () => {
    editor.clearCanvas();
    dispatch("clear");
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
  });

  $: if (editor) {
    const chromaColor = chroma(pickedColor);
    const rgb = chromaColor.rgb();
    const colorInt = rgbToInt(rgb[2], rgb[1], rgb[0]);
    editor.colorInt = colorInt;
  }

  type PaintTools = Array<{
    id: string;
    mode: PaintMode;
    icon: any;
  }>
  const paintTools: PaintTools = [
    {
      id: "pencil",
      mode: "pen",
      icon: Pen,
    },
    {
      id: "eraser",
      mode: "erase",
      icon: Eraser,
    },
    {
      id: "fill",
      mode: "fill",
      icon: FillDrip,
    },
  ];
</script>

<div id="main-container" style="--width: {clientWidth}px; --height: {clientHeight}px;">
  <div id="canvas-area" bind:this={canvasArea}>
    <canvas id="background-canvas" bind:this={backgroundCanvas}></canvas>
    <canvas id="draw-canvas" bind:this={drawCanvas}></canvas>
    <canvas id="hover-canvas" bind:this={hoverCanvas}></canvas>
    <canvas id="grid-canvas" bind:this={gridCanvas}></canvas>
  </div>
  <div id="tools">
    <div class="row" id="previews">
      <canvas id="preview-canvas" bind:this={previewCanvas}></canvas>
    </div>
    <div class="row" id="paint-modes">
      {#each paintTools as tool}
        <button
          class="button icon-button"
          id={tool.id}
          data-select={editor?.paintMode === tool.mode}
          on:click={() => { editor.paintMode = tool.mode; }
        }><svelte:component this={tool.icon} width="24" height="24" /></button>
      {/each}
    </div>
    <div class="row" id="colors">
      <label class="button color-pick-button">
        <Plus width="24" height="24" />
        <input class="input-color" type="color" bind:value={colorValue} on:change={() => {
          pickedColor = colorValue;
          colorPallet.push(pickedColor);
          currentPallet = colorPallet.toArray().reverse();
        }} />
      </label>
      {#each currentPallet as color}
        <button class="button color-pallet-button" style="--palletColor: {color}" data-select={pickedColor === color} on:click={() => {
          pickedColor = color;
        }}>
          <span class="icon-wrapper">
            <Pencil width="24" height="24" stroke="white" stroke-width="20" />
          </span>
        </button>
      {/each}
    </div>
    <div class="row" id="actions">
      <button class="button grid-button" data-select={visibleGrid} on:click={() => {
        visibleGrid = editor.toggleVisibleGrid();
      }}><BorderNone width="24" height="24" /></button>
      <button class="button clear-button" id="clear" on:click={onClear}><TrashCan width="24" height="24" /></button>
    </div>
  </div>
</div>

<style lang="scss">
  :global(svg:focus) {
    outline: none;
  }

  :host {
    display: block;
    max-width: 1920px;
    width: 100%;
  }

  canvas {
    image-rendering: pixelated;
    outline: 1px solid black;
  }

  .input-color {
    cursor: pointer;
    position: absolute;
    opacity: 0;
  }
  
  .button {
    padding: 0.75rem;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    border: 0;
    border-radius: 2px;
    margin: 2px;
    outline-style: solid;
    outline-width: 2px;
    outline-color: transparent;
    transition: all 100ms ease-out;
    background-color: #e5e5e5;

    &:hover {
      filter: opacity(0.72);
    }

    &:active {
      filter: opacity(0.86);
    }
  }
  
  .icon-button {
    fill: #404040;

    &[data-select="true"] {
      background-color: #ffffff;
      outline-color: #0ea5e9;
      fill: #020617;
    }  
  }

  .color-pallet-button {
    background-color: var(--palletColor);
    
    &[data-select="ture"] {
      background-color: var(--palletColor);
      outline: #0ea5e9 2px solid;
    }

    &[data-select="false"] {
      span {
        opacity: 0;
      }
    }
  }

  .grid-button {
    &[data-select="true"] {
      background-color: #020617;
      fill: #ffffff;
    }
  }

  .row {
    display: flex;
    flex-flow: wrap row;
    gap: 0.5rem;
  }

  #main-container {
    display: flex;
    justify-content: space-evenly;
  }

  #canvas-area {
    position: relative;
    width: var(--width);
    height: var(--height);

    canvas {
      position: absolute;
    }
  }

  #tools {
    max-width: 256px;

    & > * + * {
      margin-top: 1rem;
    }
  }
  
  #clear {
    fill: #7f1d1d;
    background-color: #fecaca;
    border-color: #7f1d1d;

    &:hover {
      fill: #fecaca;
      background-color: #ef4444;
    }
  }
</style>
