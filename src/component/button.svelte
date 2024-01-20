<script lang="ts">
  import { twMerge } from "tailwind-merge";
  let className: string = "";
  export { className as class };
  export let disabled = false;
  export let help: string;
  let active = false;

  const setActive = (val: boolean) => () => (active = val);
</script>

<button
  class={twMerge(
    "relative grid cursor-pointer place-items-center rounded-sm bg-neutral-200 fill-slate-700 p-3 outline outline-2 outline-transparent transition-all duration-100 hover:brightness-105 focus:ring-1 active:brightness-95 disabled:pointer-events-none disabled:opacity-60",
    className
  )}
  on:click
  {disabled}
  on:mouseenter={setActive(true)}
  on:mouseleave={setActive(false)}
>
  <slot />
  {#if help}
    <span
      class="absolute bottom-[calc(100%+2px)] z-10 whitespace-nowrap rounded-sm bg-gray-800 px-1.5 py-0.5 text-xs tracking-wide text-gray-100 shadow-sm transition-opacity {active
        ? 'opacity-100'
        : 'opacity-0'}"
    >
      {help}
    </span>
  {/if}
</button>

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
  @import "../app.postcss";
</style>
