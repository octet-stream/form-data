import isReadStream from "./isReadStream"
import isFile from "./isFile"

/**
 * Returns filename for File, Blob and streams (where possible)
 */
function getFilename(value: unknown): string {
  if (isReadStream(value)) {
    return String(value.path)
  }

  if (isFile(value) && value.name) {
    return value.name
  }

  return "blob"
}

export default getFilename
