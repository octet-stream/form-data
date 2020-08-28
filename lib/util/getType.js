const basicTypes = [
  "null",
  "number",
  "object",
  "array",
  "string",
  "function",
  "undefined",
  "boolean"
]

/**
 * Get a string with type name of the given value
 *
 * @param {any} val
 *
 * @return {string}
 *
 * @api private
 */
function getType(val) {
  const type = Object.prototype.toString.call(val).slice(8, -1)

  if (basicTypes.includes(type.toLowerCase())) {
    return type.toLowerCase()
  }

  return type
}

module.exports = getType
