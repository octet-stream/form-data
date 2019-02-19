import isReadable from "./isReadable"
import isReadStream from "./isReadStream"

/**
 * Checks if given value is ONLY fs.ReadStream OR stream.Readable instance
 *
 * @param {any} value
 *
 * @return {boolean}
 */
const isStream = value => isReadStream(value) || isReadable(value)

export default isStream
