const {Readable} = require("stream")

/**
 * @api private
 */
const isReadable = val => val instanceof Readable

module.exports = isReadable
