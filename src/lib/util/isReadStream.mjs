import fs from "fs"

/**
 * @api private
 */
const isReadStream = value => value instanceof fs.ReadStream

export default isReadStream
