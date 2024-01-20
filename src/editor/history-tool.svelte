<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "../component/button.svelte";
  import Text from "../config/text.json";
  import ArrowRotateLeft from "../icon/arrow-rotate-left.svg.svelte";
  import ArrowRotateRight from "../icon/arrow-rotate-right.svg.svelte";
  import { History } from "../interaction/history";
  import type { InteractiveRendererEventMap } from "../internal/interactive-renderer";

  const dispatch = createEventDispatcher<{ restoreState: Uint32Array }>();

  const history = new History<string>();
  let canUndo: boolean;
  let canRedo: boolean;
  const updateHistory = () => {
    canUndo = history.canUndo();
    canRedo = history.canRedo();
  };

  const restoreFromState = (historyState: string) => {
    const pixelData = Uint32Array.from(historyState.split(",").map(Number));
    dispatch("restoreState", pixelData);
    updateHistory();
  };

  const setHistory = (pixelData: Uint32Array) => {
    history.push(pixelData.join(","));
    updateHistory();
  };

  const onUndo = () => {
    if (!canUndo) {
      return;
    }

    const historyState = history.undo();
    if (historyState) {
      restoreFromState(historyState);
    }
  };
  const onRedo = () => {
    if (!canRedo) {
      return;
    }

    const historyState = history.redo();
    if (historyState) {
      restoreFromState(historyState);
    }
  };

  const hotkeyMap: Record<string, Function> = {
    z: onUndo,
    y: onRedo
  };

  export const pushState = (
    e: InteractiveRendererEventMap["clear"] | InteractiveRendererEventMap["pointerdown"]
  ) => {
    setHistory(e.pixelData);
  };

  export const init = (initialValue: Uint32Array) => {
    setHistory(initialValue);
  };
</script>

<svelte:body
  on:keydown={(e) => {
    if (e.ctrlKey) {
      hotkeyMap[e.key]?.();
    }
  }}
/>

<Button help={Text.undo} on:click={onUndo} disabled={!canUndo}>
  <ArrowRotateLeft width="24" height="24" />
</Button>
<Button help={Text.redo} on:click={onRedo} disabled={!canRedo}>
  <ArrowRotateRight width="24" height="24" />
</Button>
