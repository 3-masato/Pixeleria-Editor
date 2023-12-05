<svelte:options customElement="pixeleria-editor" />

<script lang="ts">
  import { onMount } from "svelte";
  import { PixelArtEditor } from "./canvas";

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;
  
  let drawCanvas: HTMLCanvasElement;
  let editor: PixelArtEditor;
  let pickedColor: string = "#000000";

  let pressed = false;

  const pointerdown = (e: PointerEvent) => {
    pressed = true;
    
    const { clientX, clientY } = e;
    const coords = editor.getRelativeCoord(clientX, clientY);
    editor.draw(coords.x, coords.y);
  }

  const pointermove = (e: PointerEvent) => {
    if (!pressed) return;

    const { clientX, clientY } = e;
    const coords = editor.getRelativeCoord(clientX, clientY);
    editor.draw(coords.x, coords.y);
  }

  const pointerup = (e: PointerEvent) => {
    pressed = false;
  }

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
      on:pointerdown={pointerdown}
      on:pointermove={pointermove}
      on:pointerup={pointerup}
    />
  </div>
  <div id="tools">
    <div id="colors">
      <input type="color" bind:value={pickedColor} />
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
