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
    
  import { onMount } from "svelte";
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
      <button id="pencil" data-select={editor?.paintMode === "pen"} on:click={() => {
        editor.paintMode = "pen"
      }}>Pencil</button> 
      <button id="eraser" data-select={editor?.paintMode === "erase"} on:click={() => {
        editor.paintMode = "erase"
      }}>Erase</button> 
    </div>
    <div id="colors">
      <input type="color" bind:value={pickedColor} />
    </div>
    <div id="actions">
      <button id="save" on:click={onSave}>Save</button>
      <button id="clear" on:click={onClear}>Clear</button>
    </div>
  </div>
</div>

<style>
  :host {
    display: block;
    width: 1280px;
  }

  canvas {
    image-rendering: pixelated;
    outline: 1px solid black;
  }
  
  button {
    padding: 0.5rem;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    border: 2px solid #020617;
    border-radius: 0.275rem;
    margin: 2%;
  }

  button[data-select="true"] {
    outline: #0ea5e9 2px solid;
  }

  #main-container {
    display: grid;
    grid-template-areas: "canvas tools";
  }

  #canvas-area {
    grid-area: canvas;
  }

  #tools {
    grid-area: tools;
  }

  #paint-modes {
    display: flex;
    gap: 4px;
  }
  
  #actions {
    display: flex;
    gap: 4px;  
  }
</style>
