module.exports = {
  environmentVariables: {
    TS_NODE_PROJECT: "tsconfig.ava.json"
  },
  extensions: [
    "ts"
  ],
  require: [
    "ts-node/register",
  ],
  files: [
    "lib/**/*.test.ts"
  ]
}
