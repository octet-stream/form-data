const isWHATWGReadable = require("./isWHATWGReadable")
const isReadStream = require("./isReadStream")
const isReadable = require("./isReadable")

/**
 * Checks if given value is ONLY fs.ReadStream OR stream.Readable instance
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
const isStream = value => (
  isWHATWGReadable(value) || isReadStream(value) || isReadable(value)
)

module.exports = isStream
