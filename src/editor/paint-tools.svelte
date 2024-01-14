<script lang="ts">
  import type { PaintMode } from "$types/shared";
  import { createEventDispatcher } from "svelte";
  import Button from "../component/button.svelte";
  import Eraser from "../icon/eraser.svg.svelte";
  import FillDrip from "../icon/fill-drip.svg.svelte";
  import Pen from "../icon/pen.svg.svelte";

  export let currentMode: PaintMode;
  const dispatch = createEventDispatcher<{ change: PaintMode }>();

  const useClickHandler = (tool: PaintTool) => () => {
    currentMode = tool.mode;
    dispatch("change", currentMode);
  };

  type PaintTool = {
    id: string;
    mode: PaintMode;
    icon: any;
  };
  const paintTools: PaintTool[] = [
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
</script>

{#each paintTools as tool}
  <Button
    on:click={useClickHandler(tool)}
    class={currentMode === tool.mode ? "bg-slate-50 fill-slate-950 outline-sky-500" : ""}
  >
    <svelte:component this={tool.icon} width="24" height="24" />
  </Button>
{/each}

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "../app.postcss";
</style>
