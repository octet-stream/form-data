/**
 * Reads a content from given ReadableStream
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

export default readableStreamIterator
