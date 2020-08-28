const {ReadStream} = require("fs")

/**
 * @api private
 */
const isReadStream = value => value instanceof ReadStream

module.exports = isReadStream
