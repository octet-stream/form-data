const isFunction = require("./isFunction")
const isString = require("./isString")
const isObject = require("./isObject")

const names = ["Blob", "File"]

/**
 * Check if given valie is Blob or File -like object
 *
 * @param {any} value
 *
 * @return {boolean}
 *
 * @api private
 */
const isBlob = value => (
  isObject(value)
    && isString(value.type)
    && isFunction(value.arrayBuffer)
    && isFunction(value.stream)
    && isFunction(value.constructor)
    && names.includes(value[Symbol.toStringTag] || value.constructor.name)
    && "size" in value
)

module.exports = isBlob
