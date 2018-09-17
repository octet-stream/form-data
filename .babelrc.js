module.exports = {
  plugins: [
    "@babel/transform-runtime",
    ["@babel/proposal-decorators", {
      legacy: true
    }],
    "@babel/proposal-class-properties",
    "@babel/transform-async-to-generator",
    "@babel/proposal-async-generator-functions",
    ["@babel/transform-modules-commonjs", {
      mjsStrictNamespace: false
    }]
  ]
}
