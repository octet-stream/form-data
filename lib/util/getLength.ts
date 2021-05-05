import isFile from "./isFile"

const {isBuffer} = Buffer

/**
 * Returns bytes length of given value
 *
 * @api private
 */
function getLength(value: unknown): number {
  if (isBuffer(value)) {
    return value.length
  }

  if (isFile(value)) {
    return value.size
  }

  return Buffer.from(String(value)).length
}

export default getLength
