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
  import { PixelArtEditor, type PixelArtEventMap } from "./canvas";
  import { createCustomEventDispatcher } from "./event";

  export let component: HTMLElement;

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;
  
  let drawCanvas: HTMLCanvasElement;
  let editor: PixelArtEditor;
  let pickedColor: string = "#000000";

  const dispatch = createCustomEventDispatcher<PixelArtEventMap>(component);

  const onSave = () => {
    dispatch("save", editor.getVectorData());
  };

  onMount(() => {
    editor = new PixelArtEditor(drawCanvas, {
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
    <div id="colors">
      <input type="color" bind:value={pickedColor} />
    </div>
    <div id="actions">
      <button id="save" on:click={onSave}>Save</button>
    </div>
  </div>
</div>

<style>
  :host {
  }
  canvas {
    image-rendering: pixelated;
    outline: 1px solid black;
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
</style>
