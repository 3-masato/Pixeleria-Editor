<svelte:options customElement="pixeleria-editor" />

<script lang="ts">
  import { onMount } from "svelte";
  import { PixelArtEditor } from "./canvas";

  export let artWidth: number = 64;
  export let artHeight: number = 64;
  export let dotSize: number = 16;
  
  let drawCanvas: HTMLCanvasElement;
  let editor: PixelArtEditor;

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
</script>

<div id="main-container">
  <canvas
    id="draw-canvas"
    bind:this={drawCanvas}
    on:pointerdown={pointerdown}
    on:pointermove={pointermove}
    on:pointerup={pointerup}
  />
</div>

<style>
  :host {
  }
  canvas {
    image-rendering: pixelated;
    outline: 1px solid black;
  }
</style>
