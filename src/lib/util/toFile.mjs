import isBuffer from "./isBuffer"
import isBlob from "./isBlob"
import File from "./File"

function toFile(content, name, options = {}) {
  if (isBuffer(content)) {
    options.size = content.length
  } else if (isBlob(content)) {
    options.type = content.type || options.type
    options.size = content.size == null ? options.size : content.size
  }

  return new File(content, name, options)
}

export default toFile
