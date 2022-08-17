export default {
  extensions: {
    ts: "module"
  },
  nodeArguments: [
    "--no-warnings",
    "--loader=ts-node/esm/transpile-only"
  ],
  files: [
    "src/**/*.test.ts"
  ]
}
