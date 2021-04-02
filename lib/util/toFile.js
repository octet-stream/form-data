const isBlob = require("./isBlob")
const File = require("./File")

const {isBuffer} = Buffer

/** @typedef {import("fs").ReadStream} ReadStream */

/**
 * @param {ReadStream | Blob | Buffer} value
 * @parma {string} name
 * @param {{type?: string, size?: number, lastModified?: number}} [options]
 *
 * @api private
 */
function toFile(value, name, options = {}) {
  // if (value.constructor.name === "File") {
  //   return value
  // }

  if (isBuffer(value)) {
    options.size = value.length
  } else if (isBlob(value)) {
    options.type = value.type || options.type
    options.size = value.size == null ? options.size : value.size
    options.lastModified = value.lastModified == null
      ? options.lastModified
      : value.lastModified
  }

  return new File([value], name, options)
}

module.exports = toFile
