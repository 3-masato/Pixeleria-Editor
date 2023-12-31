import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";
import { defineConfig } from "vite";
import { purgeCss } from "vite-plugin-tailwind-purgecss";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ["./src/pixeleria-editor.svelte"],
      formats: ["es"]
    }
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true
      }
    }),
    purgeCss()
  ],
  server: {
    // Ports available in the AWS Cloud9 environment are 8080, 8081, or 8082.
    port: 8081
  },
  resolve: {
    alias: {
      $lib: path.resolve(".", "src/lib"),
      $types: path.resolve(".", "src/@types")
    }
  }
});
