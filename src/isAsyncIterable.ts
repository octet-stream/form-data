import {isFunction} from "./isFunction.js"
import {isObject} from "./isObject.js"

/**
 * Checks if the object implements `Symbol.asyncIterator` method
 */
export const isAsyncIterable = (
  value: unknown
): value is AsyncIterable<Uint8Array> =>
  isObject(value) &&
  isFunction((value as AsyncIterable<Uint8Array>)[Symbol.asyncIterator])
