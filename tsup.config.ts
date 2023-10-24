import {defineConfig} from "tsup"

export default defineConfig(() => ({
  entry: {
    "form-data": "src/index.ts",
    "file-from-path": "src/fileFromPath.ts",
    browser: "src/browser.ts"
  },
  outDir: "lib",
  format: ["esm", "cjs"],
  clean: true,
  dts: true,
  splitting: false
}))
