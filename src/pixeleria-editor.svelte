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
  import { EraserSolid, FillDripSolid, FloppyDiskRegular, PenSolid, PencilSolid, TrashCanRegular } from 'svelte-awesome-icons';
  import { Editor, type PixelArtEventMap } from "./editor";
  import { createCustomEventDispatcher } from "./event";

  export let component: HTMLElement;

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;
  
  let drawCanvas: HTMLCanvasElement;
  let previewCanvas: HTMLCanvasElement;
  
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
      icon: PenSolid
    },
    {
      id: "eraser",
      mode: "erase",
      icon: EraserSolid,
    },
    {
      id: "fill",
      mode: "fill",
      icon: FillDripSolid,
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
        }><svelte:component this={tool.icon} /></button>
      {/each}
    </div>
    <div id="colors">
      <label class="button color-pick-button" style="--pickedColor: {pickedColor};">
        <PencilSolid stroke="white" stroke-width="20" />
        <input class="input-color" type="color" bind:value={pickedColor} />
      </label>
    </div>
    <div id="actions">
      <button class="button" id="save" on:click={onSave}><FloppyDiskRegular /></button>
      <button class="button" id="clear" on:click={onClear}><TrashCanRegular /></button>
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
    padding: 0.5rem;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    border: 2px solid #020617;
    border-radius: 0.275rem;
    margin: 2px;

    &[data-select="true"] {
      outline: #0ea5e9 2px solid;
    }
  }

  .color-pick-button {
    background-color: var(--pickedColor);
  }

  #main-container {
    display: flex;
    justify-content: space-evenly;
  }

  #tools {
    & > * + * {
      margin-top: 8px;
    }
  }

  #paint-modes {
    display: flex;
    gap: 4px;
  }
  
  #colors {
    display: flex;
    gap: 4px;
  }
  
  #actions {
    display: flex;
    gap: 4px;  
  }
</style>
