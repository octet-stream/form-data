import * as nanoid from "nanoid"

const alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

/**
 * @api private
 *
 * @return {string}
 */
const boundary = (nanoid.default || nanoid).customAlphabet(alpha, 22)

export default boundary
