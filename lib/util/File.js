const {Readable} = require("stream")

const mime = require("mime-types")

const getStreamIterator = require("./getStreamIterator")
const isBlob = require("./isBlob")

const {isBuffer} = Buffer

/**
 * @api private
 */
class File {
  constructor(content, name, options = {}) {
    this.name = name
    this.type = options.type || mime.lookup(name) || ""
    this.size = options.size || 0
    this.lastModified = options.lastModified || Date.now()

    this.__content = content
  }

  stream() {
    const content = this.__content

    if (isBlob(content)) {
      return content.stream()
    }

    if (isBuffer(content)) {
      const readable = new Readable({read() { }})

      readable.push(content)
      readable.push(null)

      return readable
    }

    return content
  }

  async arrayBuffer() {
    const iterable = getStreamIterator(this.stream())

    const chunks = []
    for await (const chunk of iterable) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks).buffer
  }

  toString() {
    return "[object File]"
  }

  get [Symbol.toStringTag]() {
    return "File"
  }
}

module.exports = File
