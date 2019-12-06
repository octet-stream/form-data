import readableStreamIterator from "./readableStreamIterator"
import isWHATWGReadable from "./isWHATWGReadable"

/**
 * Returns stream iterator for given stream-like object
 *
 * @param {Readable | ReadableStream | ReadStream} value
 *
 * @return {AsyncIterableIterator<any>}
 *
 * @api private
 */
function getStreamIterator(value) {
  if (isWHATWGReadable(value)) {
    return readableStreamIterator(value.getReader())
  }

  return value
}

export default getStreamIterator
