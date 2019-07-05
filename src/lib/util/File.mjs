import stream from "stream"

import isBuffer from "./isBuffer"
import isBlob from "./isBlob"

class File {
  constructor(content, name, options = {}) {
    this.name = name
    this.type = options.type
    this.size = options.size || 0
    this.lastModified = options.lastModified || Date.now()

    this.__content = content
  }

  stream() {
    const content = this.__content

    if (isBlob(content)) {
      return stream.stream()
    }

    if (isBuffer(content)) {
      const readable = new stream.Readable({read() { }})

      readable.push(content)
      readable.push(null)

      return readable
    }

    return content
  }
}

export default File
