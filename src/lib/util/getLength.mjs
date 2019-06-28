import fs from "promise-fs"

import isReadStream from "./isReadStream"
import isStream from "./isStream"
import isBuffer from "./isBuffer"

/**
 * Get lenght of given value (in bytes)
 *
 * @param {any} value
 *
 * @return {number | undefined}
 */
async function getLength(value) {
  if (isStream(value)) {
    if (!isReadStream(value)) {
      return undefined
    }

    return fs.stat(value.path).then(({size}) => size)
  }

  if (isBuffer(value)) {
    return value.length
  }

  return Buffer.from(String(value)).length
}

export default getLength
