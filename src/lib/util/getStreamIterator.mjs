import isWHATWGReadable from "./isWHATWGReadable"
import StreamIterator from "./StreamIterator"
import isFunction from "./isFunction"

function getStreamIterator(value) {
  if (isWHATWGReadable(value)) {
    const reader = value.getReader()

    return reader.read.bind(reader)
  }

  if (!isFunction(value[Symbol.asyncIterator])) {
    return new StreamIterator(value)
  }

  return value
}

export default getStreamIterator
