import {Readable} from "stream"
import {ReadStream} from "fs"

import {ReadableStream} from "web-streams-polyfill"

import readableStreamIterator from "./readableStreamIterator"
import isWHATWGReadable from "./isWHATWGStream"

/**
 * Returns iterator for ReadableStream
 */
function getStreamIterator(value: Readable | ReadStream | ReadableStream) {
  if (isWHATWGReadable(value)) {
    return readableStreamIterator(value.getReader())
  }

  return value
}

export default getStreamIterator
