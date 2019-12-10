import {Readable} from "stream"

/**
 * @api private
 */
const isReadable = val => val instanceof Readable

export default isReadable
