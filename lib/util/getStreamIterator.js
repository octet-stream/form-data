const readableStreamIterator = require("./readableStreamIterator")
const isWHATWGReadable = require("./isWHATWGReadable")

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

module.exports = getStreamIterator
