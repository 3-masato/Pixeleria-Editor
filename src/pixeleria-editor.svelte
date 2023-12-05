<svelte:options customElement="pixeleria-editor" />

<script lang="ts">
  import { onMount } from "svelte";
  import { PixelArtEditor } from "./canvas";

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

  const width = 64;
  const height = 64;

  const dotSize = 16;

  const canvasWidth = width * dotSize;
  const canvasHeight = height * dotSize;

  onMount(() => {
    editor = new PixelArtEditor(drawCanvas, {
      width,
      height,
      dotSize
    });
  });
</script>

<div id="main-container">
  <canvas
    id="draw-canvas"
    width={canvasWidth}
    height={canvasHeight}
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
    outline: 1px solid black;
  }
</style>
