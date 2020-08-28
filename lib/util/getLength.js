const {promises: fs} = require("fs")

const isReadStream = require("./isReadStream")
const isStream = require("./isStream")
const isBlob = require("./isBlob")

const {isBuffer} = Buffer
const {stat} = fs

/**
 * Get lenght of given value (in bytes)
 *
 * @param {any} value
 *
 * @return {number | undefined}
 *
 * @api private
 */
async function getLength(value) {
  if (isStream(value)) {
    if (!isReadStream(value)) {
      return undefined
    }

    return stat(value.path).then(({size}) => size)
  }

  if (isBuffer(value)) {
    return value.length
  }

  if (isBlob(value)) {
    return value.size
  }

  return Buffer.from(String(value)).length
}

module.exports = getLength
