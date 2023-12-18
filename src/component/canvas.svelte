<script lang="ts">
	import { twMerge } from "tailwind-merge";

	export let id: string;
	export let ref: HTMLCanvasElement;
	let className: string = "";
	export { className as class };
</script>

<canvas
	class={twMerge("outline outline-1 outline-black rendering-pixelated", className)}
	{id}
	bind:this={ref}
/>

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
	@import "../app.postcss";
</style>
