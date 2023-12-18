/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	variants: {
		// all the following default to ['responsive']
		imageRendering: ["responsive"]
	},
	theme: {
		extend: {}
	},
	plugins: [require("tailwindcss-image-rendering")()]
};
