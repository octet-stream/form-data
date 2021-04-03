import {ReadableStream} from "web-streams-polyfill"

import isFunction from "./isFunction"
import isObject from "./isObject"

/**
 * Check if given value is ReadableStream
 */
const isWHATWGStream = (value: unknown): value is ReadableStream => (
  isObject(value as ReadableStream)
  && isFunction((value as ReadableStream).cancel)
  && isFunction((value as ReadableStream).getReader)
  && isFunction((value as ReadableStream).pipeTo)
  && isFunction((value as ReadableStream).pipeThrough)
  && isFunction((value as ReadableStream).constructor)
  && (value as ReadableStream).constructor.name === "ReadableStream"
)

export default isWHATWGStream
