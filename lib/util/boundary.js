const {randomBytes} = require("crypto")

/**
 * @api private
 *
 * @return {string}
 */
const boundary = () => randomBytes(16).toString("hex")

module.exports = boundary
