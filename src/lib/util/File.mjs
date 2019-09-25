import stream from "stream"

import getStreamIterator from "./getStreamIterator"
import isBuffer from "./isBuffer"
import isBlob from "./isBlob"

/**
 * @api private
 */
class File {
  constructor(content, name, options = {}) {
    this.name = name
    this.type = options.type || ""
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
      const readable = new stream.Readable({read() { }})

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

export default File
