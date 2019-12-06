const config = {
  plugins: [
    ["@babel/proposal-decorators", {
      legacy: true
    }],
    "@babel/proposal-class-properties",
    "@babel/transform-runtime",
  ]
}

if (!process.env.BABEL_ESM) {
  config.plugins.push(
    "@babel/transform-modules-commonjs",
    ["add-module-exports", {
      addDefaultProperty: true
    }]
  )
}

module.exports = config
