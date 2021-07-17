module.exports = {
  environmentVariables: {
    TS_NODE_COMPILER: "ttypescript",
    TS_NODE_PROJECT: "tsconfig.cjs.json"
  },
  extensions: [
    "ts"
  ],
  require: [
    "ts-node/register/transpile-only",
  ],
  files: [
    "lib/**/*.test.ts"
  ]
}
