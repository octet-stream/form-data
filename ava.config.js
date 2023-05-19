export default {
  failFast: true,
  environmentVariables: {
    TS_NODE_PROJECT: "./tsconfig.ava.json"
  },
  extensions: {
    ts: "module"
  },
  files: [
    "src/**/*.test.ts"
  ]
}
