/**
 * Reads a content from given ReadableStream
 *
 * @yield {any}
 *
 * @api private
 */
async function* readableStreamIterator(reader) {
  while (true) {
    const {done, value} = await reader.read()

    if (done) {
      return value
    }

    yield value
  }
}

module.exports = readableStreamIterator
