<script lang="ts">
  import type { PaintMode } from "$types/shared";
  import { createEventDispatcher } from "svelte";
  import Button from "../component/button.svelte";
  import Text from "../config/text.json";
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
    help: string;
    icon: any;
  };
  const paintTools: PaintTool[] = [
    {
      id: "pen",
      mode: "pen",
      help: Text.pen,
      icon: Pen
    },
    {
      id: "eraser",
      mode: "erase",
      help: Text.erase,
      icon: Eraser
    },
    {
      id: "fill",
      mode: "fill",
      help: Text.fill,
      icon: FillDrip
    }
  ];
</script>

{#each paintTools as tool}
  <Button
    class={currentMode === tool.mode ? "bg-slate-50 fill-slate-950 outline-sky-500" : ""}
    help={tool.help}
    on:click={useClickHandler(tool)}
  >
    <svelte:component this={tool.icon} width="24" height="24" />
  </Button>
{/each}

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "../app.postcss";
</style>
