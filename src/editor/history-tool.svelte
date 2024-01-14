<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "../component/button.svelte";
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

    console.log(history);
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

  export const pushState = (
    e: InteractiveRendererEventMap["clear"] | InteractiveRendererEventMap["pointerdown"]
  ) => {
    setHistory(e.pixelData);
  };

  export const init = (initialValue: Uint32Array) => {
    setHistory(initialValue);
  };
</script>

<Button on:click={onUndo} disabled={!canUndo}>
  <ArrowRotateLeft width="24" height="24" />
</Button>
<Button on:click={onRedo} disabled={!canRedo}>
  <ArrowRotateRight width="24" height="24" />
</Button>
