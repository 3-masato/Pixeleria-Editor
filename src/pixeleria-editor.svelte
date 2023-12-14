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
  import type { PaintMode } from "$types/shared";
  import { onMount } from "svelte";
  import { ColorPallet } from "./color-pallet";
  import { Editor, type PixelArtEventMap } from "./editor";
  import { createCustomEventDispatcher } from "./event";
  import Eraser from "./icon/eraser.svg.svelte";
  import FillDrip from "./icon/fill-drip.svg.svelte";
  import FloppyDisk from "./icon/floppy-disk.svg.svelte";
  import Pen from "./icon/pen.svg.svelte";
  import Pencil from "./icon/pencil.svg.svelte";
  import Plus from "./icon/plus.svg.svelte";
  import TrashCan from "./icon/trash-can.svg.svelte";

  export let component: HTMLElement;

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;
  
  let drawCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;
  
  const colorPallet = new ColorPallet();
  let currentPallet = colorPallet.toArray();
  let editor: Editor;
  let pickedColor: string = "#000000";

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onSave = () => {
    dispatch("save", {
      pixelData: editor.getCompressedData(),
      imageData: editor.getImageDataURI()
    });
  };

  const onClear = () => {
    editor.clearCanvas();
    dispatch("clear");
  };

  onMount(() => {
    editor = new Editor(drawCanvas, previewCanvas, {
      width: artWidth,
      height: artHeight,
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
    <div id="actions">
      <button class="button" id="save" on:click={onSave}><FloppyDisk width="24" height="24" /></button>
      <button class="button" id="clear" on:click={onClear}><TrashCan width="24" height="24" /></button>
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

    &[data-select="true"] {
      outline: #0ea5e9 2px solid;
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
  
  #actions {
    display: flex;
    gap: 4px;  
  }
</style>
