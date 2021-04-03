module.exports = {
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
