const {inspect} = require("util")

const Blob = require("fetch-blob")

/**
 * @api public
 */
class File extends Blob {
  /**
   *
   * @param {Array<string | Blob | ArrayBufferLike | ArrayBufferView | Buffer>} blobParts
   * @param {string} name
   * @param {{type?: string, size?: number, lastModified?: number}} options
   */
  constructor(blobParts, name, options = {}) {
    super(blobParts, options)

    this.name = name
    this.lastModified = options.lastModified || Date.now()
  }

  toString() {
    return "[object File]"
  }

  get [Symbol.toStringTag]() {
    return "File"
  }

  [inspect.custom]() {
    return "File"
  }
}

// function fromPath() {}

// function fromReadStream() {}

module.exports = File
