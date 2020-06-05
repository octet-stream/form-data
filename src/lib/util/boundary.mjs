import crypto from "crypto"

/**
 * @api private
 *
 * @return {string}
 */
const boundary = () => crypto.randomBytes(16).toString("hex")

export default boundary
