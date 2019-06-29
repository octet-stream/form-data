import readableStreamIterator from "./readableStreamIterator"
import isWHATWGReadable from "./isWHATWGReadable"
import StreamIterator from "./StreamIterator"
import isFunction from "./isFunction"

/**
 * Returns stream iterator for given stream-like object
 *
 * @param {Readable | ReadableStream | ReadStream} value
 *
 * @return {AsyncIterableIterator<any>}
 */
function getStreamIterator(value) {
  if (isWHATWGReadable(value)) {
    return readableStreamIterator(value.getReader())
  }

  if (!isFunction(value[Symbol.asyncIterator])) {
    return new StreamIterator(value)
  }

  return value
}

export default getStreamIterator
