/**
 * Concap multiple strings into the one
 *
 * @param {string[]} strings
 *
 * @return {sting}
 *
 * @api private
 */
const concat = strings => Array.prototype.join.call(strings, "")

export default concat
