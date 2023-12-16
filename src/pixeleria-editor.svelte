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
  import type { NumericArray, PaintMode } from "$types/shared";
  import { onMount } from "svelte";
  import { PixelConverter } from "./canvas/pixel-converer";
  import { ColorPallet } from "./color-pallet";
  import { Editor, type PixelArtEventMap } from "./editor";
  import { createCustomEventDispatcher } from "./event";
  import Eraser from "./icon/eraser.svg.svelte";
  import FillDrip from "./icon/fill-drip.svg.svelte";
  import Pen from "./icon/pen.svg.svelte";
  import Pencil from "./icon/pencil.svg.svelte";
  import Plus from "./icon/plus.svg.svelte";
  import TrashCan from "./icon/trash-can.svg.svelte";

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
  
  let drawCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;
  
  const colorPallet = new ColorPallet();
  let currentPallet = colorPallet.toArray();
  let editor: Editor;
  let pickedColor: string = "#000000";

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onClear = () => {
    editor.clearCanvas();
    dispatch("clear");
  };

  onMount(() => {
    editor = new Editor(drawCanvas, previewCanvas, {
      width: Number(artWidth),
      height: Number(artHeight),
      dotSize
    });
  });

  $: if (editor) {
    editor.setColor(pickedColor);
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

<div id="main-container">
  <div id="canvas-area">
    <canvas
      id="draw-canvas"
      bind:this={drawCanvas}
    />
  </div>
  <div id="tools">
    <div id="previews">
      <canvas bind:this={previewCanvas}></canvas>
    </div>
    <div id="paint-modes">
      {#each paintTools as tool}
        <button
          class="button"
          id={tool.id}
          data-select={editor?.paintMode === tool.mode}
          on:click={() => { editor.paintMode = tool.mode; }
        }><svelte:component this={tool.icon} width="24" height="24" /></button>
      {/each}
      <button class="button" id="clear" on:click={onClear}><TrashCan width="24" height="24" /></button>
    </div>
    <div id="colors">
      <label class="button color-pick-button">
        <Plus width="24" height="24" />
        <input class="input-color" type="color" bind:value={pickedColor} on:change={() => {
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
  </div>
</div>

<style lang="scss">
  :global(svg:focus) {
    outline: none;
  }

  :host {
    display: block;
    max-width: 1280px;
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
    padding: 0.625rem;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    border: 2px solid #020617;
    border-radius: 4px;
    margin: 2px;
    outline-style: solid;
    outline-width: 2px;
    outline-color: transparent;
    transition: all 100ms ease-out;

    &[data-select="true"] {
      outline-color: #0ea5e9;
    }
  }

  .color-pallet-button {
    background-color: var(--palletColor);

    &[data-select="ture"] {
      outline: #0ea5e9 2px solid;
    }

    &[data-select="false"] {
      span {
        opacity: 0;
      }
    }
  }

  #main-container {
    display: flex;
    justify-content: space-evenly;
  }

  #tools {
    max-width: 256px;

    & > * + * {
      margin-top: 0.75rem;
    }
  }

  #paint-modes {
    display: flex;
    gap: 4px;
  }
  
  #colors {
    display: flex;
    gap: 4px;
    flex-flow: wrap row;
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
