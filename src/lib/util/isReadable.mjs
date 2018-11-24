const {Readable} = require("stream")

const isReadable = val => val instanceof Readable

module.exports = isReadable
