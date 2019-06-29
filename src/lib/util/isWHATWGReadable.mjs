import isFunction from "./isFunction"
import isObject from "./isObject"

/**
 * Check if given value is ReadableStream
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
const isWHATWGReadable = value => (
  isObject(value)
    && isFunction(value.cancel)
    && isFunction(value.getReader)
    && isFunction(value.pipeTo)
    && isFunction(value.pipeThrough)
    && isFunction(value.constructor)
    && value.constructor.name === "ReadableStream"
)

export default isWHATWGReadable
