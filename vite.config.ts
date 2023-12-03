import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ["./src/pixeleria-editor.svelte"],
      formats: ["es"],
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true
      }
    })
  ],
  server: {
    // Ports available in the AWS Cloud9 environment are 8080, 8081, or 8082.
    port: 8081
  }
})
