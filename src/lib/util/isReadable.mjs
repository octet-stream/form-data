const {Readable} = require("stream")

const isreadable = val => val instanceof Readable

module.exports = isreadable
