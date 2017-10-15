const isArray = Array.isArray

/**
 * Concap multiple strings into the one
 *
 * @param {string[]} ...strings
 *
 * @return {sting}
 *
 * @api private
 */
function concat(...strings) {
  if (isArray(strings[0])) {
    [strings] = strings
  }

  return Array.prototype.join.call(strings, "")
}

module.exports = concat
