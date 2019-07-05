import isBuffer from "./isBuffer"
import isBlob from "./isBlob"
import File from "./File"

/**
 * @api private
 */
function toFile(content, name, options = {}) {
  if (isBuffer(content)) {
    options.size = content.length
  } else if (isBlob(content)) {
    options.type = content.type || options.type
    options.size = content.size == null ? options.size : content.size
    options.lastModified = content.lastModified == null
      ? options.lastModified
      : content.lastModified
  }

  return new File(content, name, options)
}

export default toFile
