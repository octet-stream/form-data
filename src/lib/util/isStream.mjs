import isWHATWGReadable from "./isWHATWGReadable"
import isReadStream from "./isReadStream"
import isReadable from "./isReadable"

/**
 * Checks if given value is ONLY fs.ReadStream OR stream.Readable instance
 *
 * @param {any} value
 *
 * @return {boolean}
 */
const isStream = value => (
  isWHATWGReadable(value) || isReadStream(value) || isReadable(value)
)

export default isStream
