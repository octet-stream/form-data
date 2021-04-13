module.exports = {
  extensions: [
    "ts"
  ],
  require: [
    "dotenv/config",
    "ts-node/register/transpile-only",
  ],
  files: [
    "lib/**/*.test.ts"
  ]
}
