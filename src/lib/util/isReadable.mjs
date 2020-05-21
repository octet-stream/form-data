import stream from "stream"

/**
 * @api private
 */
const isReadable = val => val instanceof stream.Readable

export default isReadable
