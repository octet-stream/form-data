import mimes from "mime-types"

const DEFAULT_CONTENT_TYPE = "application/octet-stream"

/**
 * Returns a mime-type determined from given filename, if any.
 * Returns `application/octet-stream` if there's no mime-type for given filename found.
 *
 * @param filename A name of file to determine a mime-type from
 *
 * @api private
 */
const getMimeFromFilename = (filename: string) => (
  mimes.lookup(filename) || DEFAULT_CONTENT_TYPE
)

export default getMimeFromFilename
