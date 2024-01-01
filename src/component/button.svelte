<script lang="ts">
  import { twMerge } from "tailwind-merge";
  let className: string = "";
  export { className as class };
  export let disabled = false;
</script>

<button
  class={twMerge(
    "relative grid cursor-pointer place-items-center rounded-sm bg-neutral-200 fill-slate-700 p-3 outline outline-2 outline-transparent transition-all duration-100 hover:brightness-105 focus:ring-1 active:brightness-95 disabled:pointer-events-none disabled:opacity-60",
    className
  )}
  on:click
  {disabled}
>
  <slot />
</button>

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "../app.postcss";
</style>
