import isWHATWGReadable from "./isWHATWGReadable"
import StreamIterator from "./StreamIterator"
import isFunction from "./isFunction"

function getStreamIterator(value) {
  if (isWHATWGReadable(value)) {
    return value.getReader()
  }

  if (!isFunction(value[Symbol.asyncIterator])) {
    return new StreamIterator(value)
  }

  return value
}

export default getStreamIterator
