import isFunction from "./isFunction"
import isString from "./isString"
import isObject from "./isObject"

const names = ["Blob", "File"]

/**
 * Check if given valie is Blob or File -like object
 *
 * @param {any} value
 *
 * @return {boolean}
 */
const isBlob = value => (
  isObject(value)
    && isString(value.type)
    && isFunction(value.arrayBuffer)
    && isFunction(value.stream)
    && isFunction(value.constructor)
    && names.includes(value.constructor.name)
    && "size" in value
)

export default isBlob
