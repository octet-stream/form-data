const {ReadStream} = require("fs")

/**
 * @api private
 */
const isReadStream = value => value instanceof ReadStream

export default isReadStream
