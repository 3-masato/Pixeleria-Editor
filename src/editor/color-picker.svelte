<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Button from "../component/button.svelte";
  import Minus from "../icon/minus.svg.svelte";
  import Pencil from "../icon/pencil.svg.svelte";
  import Plus from "../icon/plus.svg.svelte";
  import { ColorPallet } from "../interaction/color-pallet";

  const colorPallet = new ColorPallet();
  let currentPallet = colorPallet.toArray();
  let colorValue: string = "#000000";
  let pickedColor: string = colorValue;
  const updatePallet = () => {
    currentPallet = colorPallet.toArray().reverse();
  };

  let colorPicker: HTMLInputElement;

  const dispatch = createEventDispatcher<{
    pick: string;
  }>();

  $: {
    dispatch("pick", pickedColor);
  }

  onMount(() => {
    updatePallet();
  });
</script>

<Button on:click={() => colorPicker.click()}>
  <Plus width="24" height="24" />
  <input
    class="visually-hidden"
    type="color"
    bind:this={colorPicker}
    bind:value={colorValue}
    on:change={() => {
      pickedColor = colorValue;
      colorPallet.push(pickedColor);
      updatePallet();
    }}
  />
</Button>
{#each currentPallet as color}
  <div class="group relative" style="--palletColor: {color}">
    <Button
      class={`bg-[var(--palletColor)] ${pickedColor === color ? "outline-sky-500" : ""}`}
      on:click={() => {
        pickedColor = color;
      }}
    >
      <Pencil width="24" height="24" stroke="white" stroke-width="20" />
    </Button>
    {#if currentPallet.length > 1}
      <button
        class="absolute left-0 top-0 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-slate-200 fill-slate-950 p-0 opacity-0 shadow-lg transition-all duration-75 ease-out hover:bg-slate-50 active:bg-slate-300 group-hover:opacity-100"
        on:click={() => {
          colorPallet.remove(color);
          updatePallet();
          pickedColor = colorPallet.currentColor;
        }}
      >
        <Minus width="8" height="8" />
      </button>
    {/if}
  </div>
{/each}

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "../app.postcss";

  .visually-hidden {
    @apply !absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0;
    clip: rect(0, 0, 0, 0) !important;
  }
</style>
